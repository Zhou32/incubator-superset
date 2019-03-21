# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=C,R,W
import datetime
import logging
import uuid
import json

from flask import url_for
from flask_appbuilder import const
from flask_appbuilder.models.sqla.interface import SQLAInterface
from werkzeug.security import generate_password_hash

from superset.savvy.views import SavvyGroupModelView,\
    SavvyRegisterInvitationUserDBView, SavvyRegisterInviteView, \
    SavvyRegisterUserDBView, SavvyUserDBModelView, EmailResetPasswordView, PasswordRecoverView, \
    SavvyRegisterUserModelView, SavvyUserStatsChartView
from superset.savvy.models import Group, ResetRequest, OrgRegisterUser, Organization,  Site
from superset.security import SupersetSecurityManager


PERMISSION_COMMON = {
    'can_add', 'can_list', 'can_show', 'can_edit', 'can_invitation', 'can_invitation_post'
}

OWNER_NOT_ALLOWED_MENU = {
    'List Roles', 'Base Permissions', 'Views/Menus',
    'Permission on Views/Menus', 'Action Log',
    'Manage', 'Druid Clusters', 'Druid Datasources',
    'Scan New Datasources', 'Refresh Druid Metadata',
    'SQL Lab',
}

OWNER_PERMISSION_MODEL = {
    'UserDBModelView',
    'DatabaseView',
    'SliceModelView',
    'SliceAddView',
    'TableModelView',
    'DashboardModelView',
    'DashboardAddView',
    'SavvyRegisterInvitationUserDBView',
    'SavvyRegisterUserModelView',
    'SavvyUserStatsChartView'
}

OWNER_PERMISSION_MENU = {
    'Security', 'List Users',
    'Sources', 'Databases', 'Tables', 'Upload a CSV',
    'Charts', 'Dashboards',
}

OWNER_INVITE_ROLES = {
    'org_superuser', 'org_user', 'org_viewer',
}

SUPERUSER_INVITE_ROLES = {
    'org_user', 'org_viewer',
}

USER_NOT_ALLOWED = {
    'Druid Clusters', 'Druid Datasources', 'Scan New Datasources', 'SavvyRegisterInvitationUserDBView',
}

NOT_ALLOWED_SQL_PERM = {
    'can_sql_json', 'can_csv', 'can_search_queries', 'can_sqllab_viz',
    'can_sqllab',
}

VIEWER_NOT_ALLOWED = {
    'Sources', 'SavvyRegisterInvitationUserDBView',
}

DB_ROLE_PREFIX = 'org_db_'


class CustomSecurityManager(SupersetSecurityManager):

    passwordrecoverview = PasswordRecoverView()
    passwordresetview = EmailResetPasswordView()
    invite_register_view = SavvyRegisterInviteView()
    invitation_view = SavvyRegisterInvitationUserDBView()
    group_view = SavvyGroupModelView

    registeruserdbview = SavvyRegisterUserDBView
    registerusermodelview = SavvyRegisterUserModelView
    userdbmodelview = SavvyUserDBModelView
    userstatschartview = SavvyUserStatsChartView

    resetRequest_model = ResetRequest
    registeruser_model = OrgRegisterUser
    organization_model = Organization
    group_model = Group


    def __init__(self, appbuilder):
        super(CustomSecurityManager, self).__init__(appbuilder)
        self.group_view.datamodel = SQLAInterface(self.group_model, self.appbuilder.get_session)

    def register_views(self):
        super(CustomSecurityManager, self).register_views()
        self.appbuilder.add_view_no_menu(self.passwordrecoverview)
        self.appbuilder.add_view_no_menu(self.passwordresetview)
        self.appbuilder.add_view_no_menu(self.invite_register_view)
        self.appbuilder.add_view_no_menu(self.invitation_view)
        self.group_view = self.appbuilder.add_view(self.group_view, "List Groups",
                                                   icon="fa-user", label="List Groups",
                                                   category="Security", category_icon="fa-cogs")

    def sync_role_definitions(self):
        """Inits the Superset application with security roles and such"""
        from superset import conf
        logging.info('Syncing role definition')

        self.create_custom_permissions()

        # Creating default roles
        self.set_role('Admin', self.is_admin_pvm)
        self.set_role('Alpha', self.is_alpha_pvm)
        self.set_role('Gamma', self.is_gamma_pvm)
        self.set_role('granter', self.is_granter_pvm)
        self.set_role('sql_lab', self.is_sql_lab_pvm)
        self.set_role('org_owner', self.is_owner_pvm)
        self.set_role('org_superuser', self.is_superuser_pvm)
        self.set_role('org_user', self.is_user_pvm)
        self.set_role('org_viewer', self.is_viewer_pvm)

        if conf.get('PUBLIC_ROLE_LIKE_GAMMA', False):
            self.set_role('Public', self.is_gamma_pvm)

        self.create_missing_perms()

        # commit role and view menu updates
        self.get_session.commit()
        self.clean_perms()

    def is_owner_pvm(self, pvm):
        result = self.is_gamma_pvm(pvm)

        for permission in PERMISSION_COMMON:
            for view in OWNER_PERMISSION_MODEL:
                result = result or (pvm.view_menu.name == view and
                                    pvm.permission.name == permission)
        result = result or (pvm.view_menu.name not in OWNER_NOT_ALLOWED_MENU)
        if pvm.view_menu.name in OWNER_NOT_ALLOWED_MENU or pvm.permission.name in NOT_ALLOWED_SQL_PERM:
            return False
        if self.is_user_defined_permission(pvm) or pvm.permission.name == 'all_database_access'\
                or pvm.permission.name == 'all_datasource_access':
            return False
        return result

    def is_superuser_pvm(self, pvm):
        result = self.is_owner_pvm(pvm)

        return result

    def is_user_pvm(self, pvm):
        result = self.is_superuser_pvm(pvm)

        if pvm.view_menu.name in USER_NOT_ALLOWED or self.is_admin_only(pvm):
            return False
        return result

    def is_viewer_pvm(self, pvm):
        result = self.is_user_pvm(pvm)
        if pvm.view_menu.name in VIEWER_NOT_ALLOWED:
            return False
        return result

    @property
    def get_url_for_recover(self):
        return url_for('%s.%s' % (self.passwordrecoverview.endpoint,
                                  self.passwordrecoverview.default_view))

    def get_url_for_reset(self, token):
        return url_for('%s.%s' % (self.passwordresetview.endpoint,
                                  self.passwordresetview.default_view), token=token)

    def get_url_for_invitation(self, token):
        return url_for('%s.%s' % (self.invite_register_view.endpoint,
                                  'invitation'), invitation_hash=token, _external=True)

    def add_reset_request(self, email):
        """try look for not used existed hash for user"""
        reset_request = self.get_session.query(self.resetRequest_model)\
            .filter_by(email=email, used=False).first()
        if reset_request is not None:
            print(reset_request.id)
            self.set_token_used(reset_request.reset_hash)
        reset_request = self.resetRequest_model()
        reset_request.email = email
        reset_request.used = False
        user = self.find_user(email=email)

        if user is not None:
            reset_request.user_id = user.id
            hash_token = generate_password_hash(email)
            reset_request.reset_hash = hash_token
            try:
                self.get_session.add(reset_request)
                self.get_session.commit()
                return hash_token
            except Exception as e:
                print(e)
                self.appbuilder.get_session.rollback()
        return None

    def find_user_by_token(self, token):
        reset_request = self.get_session.query(self.resetRequest_model)\
            .filter_by(reset_hash=token, used=False).first()
        if reset_request is not None:
            time = reset_request.reset_date
            current_time = datetime.datetime.now()
            time_diff = (current_time - time).total_seconds()
            if time_diff < 3600:
                """Check time diff of reset hash time"""
                email = reset_request.email
                user = self.find_user(email=email)
                # print(user)
                return user
        return None

    def set_token_used(self, token):
        reset_request = self.get_session.query(self.resetRequest_model)\
            .filter_by(reset_hash=token).first()
        reset_request.used = True
        try:
            self.get_session.merge(reset_request)
            self.get_session.commit()
        except Exception as e:
            print(e)
            self.get_session.rollback()

    def to_reset_view(self):
        return url_for('%s.%s' % (self.passwordresetview.endpoint,
                                  self.passwordresetview.default_view))

    def find_invite_roles(self, inviter_id):
        inviter = self.get_user_by_id(inviter_id)
        for role in inviter.roles:
            if role.name == 'org_owner':
                invite_roles = [self.find_role(role_name) for role_name in OWNER_INVITE_ROLES]
                return [(str(invite_role.id), invite_role.name) for invite_role in invite_roles]
            elif role.name == 'org_superuser':
                invite_roles = [self.find_role(role_name) for role_name in SUPERUSER_INVITE_ROLES]
                return [(str(invite_role.id), invite_role.name) for invite_role in invite_roles]
            elif role.name == 'Admin':
                return [(str(invite_role.id), invite_role.name) for invite_role in self.get_all_roles()]

    def add_invite_register_user(self, email, organization, first_name=None, last_name=None, role=None,
                                 inviter=None, password='', hashed_password=''):
        invited_user = self.registeruser_model()
        # email and organization parameters should be always available.
        invited_user.email = email
        invited_user.organization = organization.organization_name

        if first_name:
            invited_user.first_name = first_name
        if last_name:
            invited_user.last_name = last_name
        if inviter:
            invited_user.inviter = inviter
        if role:
            invited_user.role_assigned = role
            if role == str(self.find_role('org_superuser').id) and organization.superuser_number >= 3:
                logging.error(u'Superusers reach limit for %s.' % organization.organization_name)
                raise ValueError('Superuser reaches limit.')
        if hashed_password:
            invited_user.password = hashed_password
        else:
            invited_user.password = generate_password_hash(password)

        invited_user.registration_hash = str(uuid.uuid1())
        try:
            self.get_session.add(invited_user)
            self.get_session.commit()
        except Exception as e:
            self.get_session.rollback()
            logging.error(e)
            raise ValueError('Invitation is failed because of database integrity error')
        return invited_user

    def edit_invite_register_user_by_hash(self, invitation_hash, first_name=None, last_name=None,
                                          password='', hashed_password=''):
        invited_user = self.find_register_user(invitation_hash)
        if first_name:
            invited_user.first_name = first_name
        if last_name:
            invited_user.last_name = last_name
        if hashed_password:
            invited_user.password = hashed_password
        else:
            invited_user.password = generate_password_hash(password)
        try:
            self.get_session.merge(invited_user)
            self.get_session.commit()
            return invited_user
        except Exception as e:
            self.get_session.rollback()
            logging.error(e)
            return None

    def del_invite_register_user(self, register_user):
        try:
            self.get_session.delete(register_user)
            return True
        except Exception:
            self.get_session.rollback()
            return False

    def find_invite_hash(self, invitation_hash):
        try:
            reg_user = self.find_register_user(invitation_hash)
            org_name = reg_user.organization

            inviter = self.get_user_by_id(reg_user.inviter)
            inviter = inviter.get_full_name()
            email = reg_user.email
            role = self.get_session.query(self.role_model).filter_by(id=reg_user.role_assigned).first()
            if datetime.datetime.now() > reg_user.valid_date:
                raise Exception
            return org_name, inviter, email, role.name
        except Exception as e:
            logging.error(e)
            return None, None, None, None

    def find_org(self, org_name=None, user_id=None):
        if org_name:
            return self.get_session.query(self.organization_model).filter_by(organization_name=org_name).first()
        elif user_id:
            return self.get_session.query(self.organization_model).\
                filter(self.organization_model.users.any(id=user_id)).scalar()

    def add_org_user(self, email, first_name, last_name, hashed_password, organization, role_id):
        try:
            org = self.find_org(organization)
            user = self.user_model()
            user.email = email
            user.username = email
            user.first_name = first_name
            user.last_name = last_name
            user.active = True
            user.password = hashed_password
            role = self.get_session.query(self.role_model).filter_by(id=role_id).first()
            user.roles.append(role)
            if org is not None:
                org.users.append(user)
                db_role = self.find_role(DB_ROLE_PREFIX+org.organization_name)
                user.roles.append(db_role)
            self.get_session.add(user)
            self.get_session.commit()
            return user
        except Exception as e:
            logging.error(e)
            return False

    def add_org(self, reg, user):
        new_org = self.organization_model()
        new_org.organization_name = reg.organization
        new_org.users.append(user)
        try:
            self.get_session.add(new_org)
            self.get_session.commit()
            return new_org
        except Exception as e:
            logging.error(const.LOGMSG_ERR_SEC_ADD_REGISTER_USER.format(str(e)))
            self.appbuilder.get_session.rollback()
            return None

    def delete_org(self, organization):
        try:
            self.get_session.delete(organization)
            self.get_session.commit()
        except Exception:
            self.get_session.rollback()

    def add_register_user_org_admin(self, **kwargs):
        register_user = self.registeruser_model()
        register_user.first_name = kwargs['first_name']
        register_user.last_name = kwargs['last_name']
        register_user.username = kwargs['email']
        register_user.email = kwargs['email']
        register_user.organization = kwargs['organization']
        register_user.password = generate_password_hash(kwargs['password'])
        register_user.registration_hash = str(uuid.uuid1())
        register_user.inviter = '1'
        try:
            self.get_session.add(register_user)
            self.get_session.commit()
            return register_user
        except Exception as e:
            logging.error(const.LOGMSG_ERR_SEC_ADD_REGISTER_USER.format(str(e)))
            self.appbuilder.get_session.rollback()
            return None

    def create_db_role(self, database_name, database_uri, owner):
        from superset.models.core import Database
        from superset.connectors.sqla.models import SqlaTable

        session = self.appbuilder.get_session
        db_model = SQLAInterface(Database, session=session)
        table_model = SQLAInterface(SqlaTable, session=session)
        db = db_model.obj()
        permission_list = []
        db.database_name = database_name
        db.sqlalchemy_uri = database_uri
        db.cache_timeout = None
        db.force_ctas_schema = None
        db.set_sqlalchemy_uri(db.sqlalchemy_uri)
        self.merge_perm('database_access', db.perm)
        permission_list.append(self.find_permission_view_menu('database_access', db.perm))
        db_model.add(db)
        # print('db finished')
        for schema in db.all_schema_names():
            if schema in database_uri:
                schema_perm = self.get_schema_perm(db, schema)
                self.merge_perm(
                    'schema_access', schema_perm)
                permission_list.append(self.find_permission_view_menu('schema_access', schema_perm))
                # print('for schema ', schema)

                for table_name in db.all_table_names_in_schema(schema=schema):
                    table = table_model.obj()
                    table.database = db
                    table.table_name = table_name
                    table.schema = schema
                    with session.no_autoflush:
                        table_query = session.query(SqlaTable).filter(
                            SqlaTable.table_name == table.table_name,
                            SqlaTable.schema == table.schema,
                            SqlaTable.database_id == table.database.id)
                        if session.query(table_query.exists()).scalar():
                            logging.debug('Table already exists')
                    # Fail before adding if the table can't be found
                    try:
                        # print('add table')
                        # table.get_sqla_table_object()
                        table_model.add(table)
                        table.fetch_metadata()
                        if table.get_perm():
                            self.merge_perm('datasource_access', table.get_perm())
                            permission_list.append(self.find_permission_view_menu('datasource_access', table.get_perm()))
                        if table.schema:
                            self.merge_perm('schema_access', table.schema_perm)
                        # print('add table fin')
                    except Exception as e:
                        logging.exception(f'Got an error in pre_add for {table.name}')
                break

        print(permission_list)
        permission_list_not_none = [permission for permission in permission_list if permission is not None]
        # owner = self.find_user(email='bwhsdzf@gmail.com')
        db_role = self.rolemodelview.datamodel.obj()
        db_role.name = DB_ROLE_PREFIX + db.database_name
        db_role.permissions = permission_list_not_none

        self.rolemodelview.datamodel.add(db_role)
        # print('add role')

        owner.roles.append(db_role)
        self.get_session.merge(owner)
        self.get_session.commit()

        return db_role

    def search_site(self, state='', city=''):
        return self.get_session.query(Site).all()

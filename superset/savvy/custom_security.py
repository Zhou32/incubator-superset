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

from flask import url_for
from werkzeug.security import generate_password_hash

from superset.savvy.savvy_views import EmailResetPasswordView,\
    InviteRegisterView, PasswordRecoverView
from superset.savvy.savvymodels import ResetRequest
from superset.security import SupersetSecurityManager
from superset.savvy.organization import OrgRegisterUser, Organization

PERMISSION_COMMON = {
    'can_add', 'can_list', 'can_show', 'can_edit',
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
}

OWNER_PERMISSION_MENU = {
    'Security', 'List Users',
    'Sources', 'Databases', 'Tables', 'Upload a CSV',
    'Charts', 'Dashboards',
}

SUPERUSER_PERMISSION_MENU = {
    'Security', 'List Users',
    'Sources', 'Databases', 'Tables', 'Upload a CSV',
    'Charts', 'Dashboards',
}

USER_NOT_ALLOWED_MENU = {
    'Druid Clusters', 'Druid Datasources', 'Scan New Datasources',
}

VIEWER_NOT_ALLOWED_MENU = {
    'Sources',
}


class CustomSecurityManager(SupersetSecurityManager):

    passwordrecoverview = PasswordRecoverView()
    passwordresetview = EmailResetPasswordView()
    invite_register_view = InviteRegisterView()

    resetRequestModel = ResetRequest
    inviteRegisterModel = OrgRegisterUser
    organizationModel = Organization

    def register_views(self):
        super(CustomSecurityManager, self).register_views()
        self.appbuilder.add_view_no_menu(self.passwordrecoverview)
        self.appbuilder.add_view_no_menu(self.passwordresetview)
        self.appbuilder.add_view_no_menu(self.invite_register_view)

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
        self.set_role('org_user', self.is_user_pvm)
        self.set_role('org_viewer', self.is_viewer_pvm)

        if conf.get('PUBLIC_ROLE_LIKE_GAMMA', False):
            self.set_role('Public', self.is_gamma_pvm)

        self.create_missing_perms()

        # commit role and view menu updates
        self.get_session.commit()
        self.clean_perms()

    def is_owner_pvm(self, pvm):
        result = self.is_alpha_only(pvm)

        for permission in PERMISSION_COMMON:
            for view in OWNER_PERMISSION_MODEL:
                result = result or (pvm.view_menu.name == view and
                                    pvm.permission.name == permission)
        result = result or (pvm.view_menu.name not in OWNER_NOT_ALLOWED_MENU)
        if pvm.view_menu.name in OWNER_NOT_ALLOWED_MENU:
            return False
        if self.is_sql_lab_pvm(pvm):
            return False
        return result

    def is_superuser_pvm(self, pvm):
        result = False
        for menu in SUPERUSER_PERMISSION_MENU:
            result = result or (pvm.view_menu.name == menu and
                                pvm.permission.name == 'menu_access')
        return result

    def is_user_pvm(self, pvm):
        result = self.is_gamma_pvm(pvm)
        if pvm.view_menu.name in USER_NOT_ALLOWED_MENU:
            return False
        return result

    def is_viewer_pvm(self, pvm):
        result = self.is_gamma_pvm(pvm)
        if pvm.view_menu.name in VIEWER_NOT_ALLOWED_MENU:
            return False
        return result

    @property
    def get_url_for_recover(self):
        return url_for('%s.%s' % (self.passwordrecoverview.endpoint,
                                  self.passwordrecoverview.default_view))

    def get_url_for_reset(self, token):
        return url_for('%s.%s' % (self.passwordresetview.endpoint,
                                  self.passwordresetview.default_view), token=token)

    def add_reset_request(self, email):
        """try look for not used existed hash for user"""
        reset_request = self.get_session.query(self.resetRequestModel)\
            .filter_by(email=email, used=False).first()
        if reset_request is not None:
            print(reset_request.id)
            self.set_token_used(reset_request.reset_hash)
        reset_request = self.resetRequestModel()
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
        reset_request = self.get_session.query(self.resetRequestModel)\
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
        reset_request = self.get_session.query(self.resetRequestModel)\
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

    def add_invite_register_user(self, first_name, last_name, email, role, inviter, hash,
                                 password='', hashed_password='', organization=''):

        invited_user = self.inviteRegisterModel()
        invited_user.email = email
        invited_user.first_name = first_name
        invited_user.last_name = last_name
        invited_user.inviter_id = inviter
        role = self.find_role(role)
        invited_user.role_assigned = role.id
        if hashed_password:
            invited_user.password = hashed_password
        else:
            invited_user.password = generate_password_hash(password)
        invited_user.organization = organization
        invited_user.registration_hash = hash
        try:
            self.get_session.add(invited_user)
            self.get_session.commit()
            return invited_user
        except Exception as e:
            self.get_session.rollback()
            print(e)
            return None

    def find_invite_register_user(self, invitation_hash):
        return self.get_session.query(self.inviteRegisterModel).filter_by(registration_hash=invitation_hash).first()

    def del_invite_register_user(self, register_user):
        try:
            self.get_session.delete(register_user)
            return True
        except Exception:
            self.get_session.rollback()
            return False

    def find_invite_hash(self, invitation_hash):
        org_name = 'ericorg'
        inviter = 'eric eric'
        email = 'bwhsdzf@gmail.com'
        role = 'org_user'
        return org_name, inviter, email, role

    def find_org(self, org_name):
        return self.get_session.query(self.organizationModel).filter_by(organization_name=org_name).first()

    def add_org_user(self, email, first_name, last_name, hashed_password, organization, role_id):
        try:
            org = self.find_org(organization)
            user = self.user_model()
            user.email = email
            user.username = email
            user.first_name = first_name
            user.last_name = last_name
            user.password = hashed_password
            role = self.get_session.query(self.role_model).filter_by(id=role_id).first()
            user.roles.append(role)
            org.user.append(user)
            self.get_session.add(user)
            self.get_session.commit()
            return user
        except Exception:
            return False

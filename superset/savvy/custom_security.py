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

from superset.savvy.password_recover_views import EmailResetPasswordView,\
    PasswordRecoverView
from superset.savvy.savvymodels import Organization, ResetRequest
from superset.security import SupersetSecurityManager

PERMISSION_COMMON = {
    'can_add', 'can_list', 'can_show', 'can_edit',
}

OWNER_NOT_ALLOWED_MENU = {
    'List Roles', 'Base Permissions', 'Views/Menus', 'Permission on Views/Menus', 'Action Log',
    'Manage', 'Druid Clusters', 'Druid Datasources', 'Scan New Datasources', 'Refresh Druid Metadata',
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
    'SQL Lab', 'SQL Editor',
}

SUPERUSER_PERMISSION_MENU = {
    'Security', 'List Users',
    'Sources', 'Databases', 'Tables', 'Upload a CSV',
    'Charts', 'Dashboards',
}

USER_PERMISSION_COMMON ={
    ('can_list', '')
}

USER_PERMISSION_MENU = {
    'Sources', 'Databases', 'Tables', 'Upload a CSV',
    'Charts', 'Dashboards',
}

VIEWER_PERMISSION_MENU = {
    'Charts', 'Dashboards',
}


class CustomSecurityManager(SupersetSecurityManager):

    passwordrecoverview = PasswordRecoverView()
    passwordresetview = EmailResetPasswordView()

    resetRequestModel = ResetRequest
    orgModel = Organization

    def register_views(self):
        super(CustomSecurityManager, self).register_views()
        self.appbuilder.add_view_no_menu(self.passwordrecoverview)
        self.appbuilder.add_view_no_menu(self.passwordresetview)

    # def create_custom_permissions(self):
    #     super(CustomSecurityManager, self).create_custom_permissions()
    #     self.merge_perm('can_this_form_get', 'PasswordRecoverView')
    #     self.merge_perm('can_this_form_post', 'PasswordRecoverView')
    #     self.merge_perm('reset', 'PasswordRecoverView')
    #     self.merge_perm('can_this_form_get', 'EmailResetPasswordView')
    #     self.merge_perm('can_this_form_post', 'EmailResetPasswordView')

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

        if conf.get('PUBLIC_ROLE_LIKE_GAMMA', False):
            self.set_role('Public', self.is_gamma_pvm)

        self.create_missing_perms()

        # commit role and view menu updates
        self.get_session.commit()
        self.clean_perms()

    def is_owner_pvm(self, pvm):
        result = self.is_alpha_only(pvm)
        result = result or self.is_sql_lab_pvm(pvm)
        for permission in PERMISSION_COMMON:
            for view in OWNER_PERMISSION_MODEL:
                result = result or (pvm.view_menu.name == view and pvm.permission.name == permission)
        result = result or (pvm.view_menu.name not in OWNER_NOT_ALLOWED_MENU)
        return result

    def is_superuser_pvm(self, pvm):
        result = False
        for menu in SUPERUSER_PERMISSION_MENU:
            result = result or (pvm.view_menu.name == menu and pvm.permission.name == 'menu_access')
        return result

    def is_user_pvm(self,pvm):
        result = False
        return result

    def is_viewer_pvm(self, pvm):
        return False

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

    def find_org_by_name(self, org_name):
        return self.get_session.query(self.orgModel)\
            .filter_by(org_name=org_name).first()

    def create_org(self, org_name):
        org = self.find_org_by_name(org_name)
        if org is not None:
            return False
        org = self.orgModel()
        org.org_name = org_name
        try:
            self.get_session.add(org)
            self.get_session.commit()
            return True
        except Exception:
            self.get_session.rollback()
            return False

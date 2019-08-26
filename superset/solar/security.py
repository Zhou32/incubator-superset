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

from flask import url_for
from flask_appbuilder import const, urltools
from flask_appbuilder.models.sqla.interface import SQLAInterface
from werkzeug.security import generate_password_hash, check_password_hash

from superset.solar.views import SolarBIPasswordRecoverView, SolarBIAuthDBView
from superset.solar.registerviews import SolarBIRegisterUserDBView
from superset.solar.models import ResetRequest
from superset.security import SupersetSecurityManager

PERMISSION_COMMON = {
    'can_add', 'can_list', 'can_show', 'can_edit', 'can_invitation', 'can_invitation_post'
}

NOT_ALLOWED_SQL_PERM = {
    'can_sql_json', 'can_csv', 'can_search_queries', 'can_sqllab_viz',
    'can_sqllab',
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
    'SavvyUserStatsChartView',
}

OWNER_NOT_ALLOWED_PERM_MENU = {
    'SavvySiteModelView': ['can_add', 'can_delete'],
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
    'SavvyGroupModelView', 'List Group', 'SavvySiteModelView',
}



VIEWER_NOT_ALLOWED = {
    'Sources',
}

DB_ROLE_PREFIX = 'org_db_'


class CustomSecurityManager(SupersetSecurityManager):
    passwordrecoverview = SolarBIPasswordRecoverView()

    registeruserdbview = SolarBIRegisterUserDBView
    authdbview = SolarBIAuthDBView

    resetRequest_model = ResetRequest

    def __init__(self, appbuilder):
        super(CustomSecurityManager, self).__init__(appbuilder)

    def register_views(self):
        super(CustomSecurityManager, self).register_views()
        self.appbuilder.add_view_no_menu(self.passwordrecoverview)

    def sync_role_definitions(self):
        """Inits the Superset application with security roles and such"""
        from superset import conf
        logging.info('Syncing role definition')

        self.create_custom_permissions()

        # Creating default roles
        self.set_role('granter', self.is_granter_pvm)
        self.set_role('sql_lab', self.is_sql_lab_pvm)

        self.create_missing_perms()

        # commit role and view menu updates
        self.get_session.commit()
        self.clean_perms()

    @property
    def get_url_for_recover(self):
        return url_for('%s.%s' % (self.passwordrecoverview.endpoint,
                                  self.passwordrecoverview.default_view))

    def add_reset_request(self, email):
        """try look for not used existed hash for user"""
        reset_request = self.get_session.query(self.resetRequest_model) \
            .filter_by(email=email, used=False).first()
        if reset_request is not None:
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
                self.appbuilder.get_session.rollback()
        return None

    def find_user_by_token(self, token):
        reset_request = self.get_session.query(self.resetRequest_model) \
            .filter_by(reset_hash=token, used=False).first()
        if reset_request is not None:
            time = reset_request.reset_date
            current_time = datetime.datetime.now()
            time_diff = (current_time - time).total_seconds()
            if time_diff < 3600:
                """Check time diff of reset hash time"""
                email = reset_request.email
                user = self.find_user(email=email)
                return user
        return None

    def set_token_used(self, token):
        reset_request = self.get_session.query(self.resetRequest_model) \
            .filter_by(reset_hash=token).first()
        reset_request.used = True
        try:
            self.get_session.merge(reset_request)
            self.get_session.commit()
        except Exception as e:
            self.get_session.rollback()

    def to_reset_view(self):
        return url_for('%s.%s' % (self.passwordresetview.endpoint,
                                  self.passwordresetview.default_view))


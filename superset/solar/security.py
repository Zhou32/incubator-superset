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

from superset.solar.views import PasswordRecoverView, SolarBIAuthDBView
from superset.solar.registerviews import SolarBIRegisterUserDBView
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
    passwordrecoverview = PasswordRecoverView()

    registeruserdbview = SolarBIRegisterUserDBView
    authdbview = SolarBIAuthDBView

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

    def get_url_for_recover(self):
        return url_for('%s.%s' % (self.passwordrecoverview.endpoint,
                                  self.passwordrecoverview.default_view))

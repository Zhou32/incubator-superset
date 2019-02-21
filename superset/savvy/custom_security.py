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

from superset.security import SupersetSecurityManager
from flask import url_for
from superset.savvy.password_recover_views import PasswordRecoverView, EmailResetPasswordView
from superset.savvy.savvymodels import ResetRequest
from flask_login import login_user
from werkzeug.security import generate_password_hash


class CustomSecurityManager(SupersetSecurityManager):

    passwordrecoverview = PasswordRecoverView
    passwordresetview = EmailResetPasswordView

    resetRequestModel = ResetRequest

    def register_views(self):
        super(SupersetSecurityManager, self).register_views()
        if self.passwordrecoverview:
            self.passwordrecoverview = self.appbuilder.add_view_no_menu(self.passwordrecoverview)
        if self.passwordresetview:
            self.passwordresetview = self.appbuilder.add_view_no_menu(self.passwordresetview)

    @property
    def get_url_for_recover(self):
        # print("yes recover end point")
        # print(self.passwordrecoverview.endpoint)
        # print(self.registeruser_view.endpoint)
        # print(url_for('%s.%s' % (self.passwordrecoverview.endpoint, self.passwordrecoverview.default_view)))
        # print(self.passwordrecoverview.default_view)
        # return url_for('%s.%s' % (self.registeruser_view.endpoint, self.registeruser_view.default_view))
        return url_for('%s.%s' % (self.passwordrecoverview.endpoint, self.passwordrecoverview.default_view))
        # return url_for('%s.%s' % (self.passwordresetview.endpoint, self.passwordresetview.default_view))

    def get_url_for_reset(self,user):
        login_user(user)
        return url_for('%s.%s' % (self.passwordresetview.endpoint, self.passwordresetview.default_view))

    def add_reset_request(self, email):
        reset_request = self.resetRequestModel()
        reset_request.email = email
        reset_request.used = False
        user = self.find_user(email=email)

        if user is not None:
            return True
            # reset_request.user_id=user.id
            # hash_token=generate_password_hash(email)
            # reset_request.reset_hash = hash_token
            # try:
            #     self.get_session.add(reset_request)
            #     print("commitng")
            #     self.get_session.commit()
            #     print("commited")
            #     return True
            # except Exception as e:
            #     self.appbuilder.get_session.rollback()
        return False

    def to_reset_view(self):
        return url_for('%s.%s' % (self.passwordresetview.endpoint, self.passwordresetview.default_view))






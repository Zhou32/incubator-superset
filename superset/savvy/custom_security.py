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

from flask import url_for
from superset.security import SupersetSecurityManager
from superset.savvy.password_recover_views import EmailResetPasswordView, PasswordRecoverView
from superset.savvy.savvymodels import Organization, ResetRequest
from werkzeug.security import generate_password_hash


class CustomSecurityManager(SupersetSecurityManager):

    passwordrecoverview = PasswordRecoverView
    passwordresetview = EmailResetPasswordView

    resetRequestModel = ResetRequest
    orgModel = Organization

    def register_views(self):
        super(SupersetSecurityManager, self).register_views()
        if self.passwordrecoverview:
            self.passwordrecoverview = self\
                .appbuilder.add_view_no_menu(self.passwordrecoverview)
        if self.passwordresetview:
            self.passwordresetview = self\
                .appbuilder.add_view_no_menu(self.passwordresetview)

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
            time_diff = (current_time-time).total_seconds()
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

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
from flask_appbuilder import expose, const
from flask_appbuilder.security.registerviews import RegisterUserDBView
from flask_appbuilder.security.forms import RegisterUserDBForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget
from flask_appbuilder._compat import as_unicode
from wtforms import StringField
from wtforms.validators import DataRequired
from flask_babel import lazy_gettext
from flask import flash, redirect
from ..utils.core import post_request

import boto3
import logging

email_subject = 'SavvyBI - Email Confirmation '
log = logging.getLogger(__name__)


class SavvyRegisterUserDBForm(RegisterUserDBForm):
    organisation = StringField(lazy_gettext('Organisation'),
                               validators=[DataRequired()],
                               widget=BS3TextFieldWidget())


class SavvyRegisterUserDBView(RegisterUserDBView):
    form = SavvyRegisterUserDBForm

    email_subject = email_subject

    @expose('/activation/<string:activation_hash>')
    @expose('/here')
    def activation(self, activation_hash):

        """
            Endpoint to expose an activation url, this url
            is sent to the user by email, when accessed the user is inserted
            and activated
        """
        reg = self.appbuilder.sm.find_register_user(activation_hash)

        # reg = RegisterUser()
        # reg.username = 'Colin'
        # reg.password = 'pa55word'
        # reg.email = 'chenyang.wang@zawee.work'
        # reg.last_name = 'Wang'
        # reg.first_name = 'Chenyang'
        # reg.organisation = 'Colin23'
        # activation_hash = ''
        if not reg:
            log.error(const.LOGMSG_ERR_SEC_NO_REGISTER_HASH.format(activation_hash))
            flash(as_unicode(self.false_error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        if not self.appbuilder.sm.add_user(username=reg.username,
                                           email=reg.email,
                                           first_name=reg.first_name,
                                           last_name=reg.last_name,
                                           role=self.appbuilder.sm.find_role(
                                               self.appbuilder.sm.auth_user_registration_role),
                                           password=reg.password):
            flash(as_unicode(self.error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        else:
            org_reg = self.appbuilder.sm.add_org(reg)
            aws_info = post_request('https://3ozse3mao8.execute-api.ap-southeast-2.amazonaws.com/test/createorg',
                                    {"OrgName": org_reg.organisation, "OrgID": org_reg.id})
            self.handle_aws_info(aws_info)
            self.appbuilder.sm.del_register_user(reg)
            return self.render_template(self.activation_template,
                                        username=reg.username,
                                        first_name=reg.first_name,
                                        last_name=reg.last_name,
                                        appbuilder=self.appbuilder)

    def handle_aws_info(self, info):
        access_key = info['AccessKeyId']
        secret_key = info['SecretAccessKey']
        athena_link = f'awsathena+jdbc:{access_key}:{secret_key}@athena.us-west-2.amazonaws.com/market_report_prod_ore?s3_staging_dir=s3://druid.dts.input-bucket.oregon'

    def add_registration(self, username, first_name, last_name, email, password=''):
        """
            Add a registration request for the user.

        :rtype : RegisterUser
        """
        register_user = self.appbuilder.sm.add_register_user_org(username, first_name, last_name, email, password, None,
                                                                 self.form.organisation)
        if register_user:
            if self.send_email(register_user):
                flash(as_unicode(self.message), 'info')
                return register_user
            else:
                flash(as_unicode(self.error_message), 'danger')
                self.appbuilder.sm.del_register_user(register_user)
                return None

    # username = 'Colin'
    # password = 'pa55word'
    # email = 'chenyang.wang@zawee.work'
    # family_name = 'Wang'
    # given_name = 'Chenyang'
    # role = 'admin'
    # organisation = 'Colin23'

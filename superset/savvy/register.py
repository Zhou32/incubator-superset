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
from flask_appbuilder.security.forms import DynamicForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget, BS3PasswordFieldWidget
from flask_appbuilder._compat import as_unicode
from wtforms import StringField, BooleanField, PasswordField, SelectField
from flask_babel import lazy_gettext
from flask import flash, redirect, url_for
from ..utils.core import post_request

from wtforms.validators import DataRequired, EqualTo, Email
from flask_appbuilder.validators import Unique

import logging

email_subject = 'SavvyBI - Email Confirmation '
log = logging.getLogger(__name__)


class SavvyRegisterUserDBForm(DynamicForm):
    organization = StringField(lazy_gettext('Organization'),
                               validators=[DataRequired()],
                               widget=BS3TextFieldWidget())
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()], widget=BS3TextFieldWidget())
    first_name = StringField(lazy_gettext('First Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())
    last_name = StringField(lazy_gettext('Last Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())

    password = PasswordField(lazy_gettext('Password'),
                             description=lazy_gettext(
                                 'Please use a good password policy, this application does not check this for you'),
                             validators=[DataRequired()],
                             widget=BS3PasswordFieldWidget())
    conf_password = PasswordField(lazy_gettext('Confirm Password'),
                                  description=lazy_gettext('Please rewrite the password to confirm'),
                                  validators=[EqualTo('password', message=lazy_gettext('Passwords must match'))],
                                  widget=BS3PasswordFieldWidget())


class SavvyRegisterInvitationUserDBForm(DynamicForm):
    role = SelectField(label=lazy_gettext('Invitation Role'),
                       choices=[('1', 'super_user'),('2', 'normal_user'), ('3', 'viewer_user')])
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()], widget=BS3TextFieldWidget())


class SavvyRegisterInvitationUserDBView(RegisterUserDBView):
    redirect_url = '/'
    form = SavvyRegisterInvitationUserDBForm
    email_subject = 'Invitation Registration'

    @expose('/invite/')
    def invitation(self):
        self._init_vars()
        form = self.form.refresh()
        widgets = self._get_edit_widget(form=form)
        self.update_redirect()
        return self.render_template(self.form_template,
                                    title=self.form_title,
                                    widgets=widgets,
                                    appbuilder=self.appbuilder
                                    )


class SavvyRegisterUserDBView(RegisterUserDBView):
    redirect_url = '/'
    form = SavvyRegisterUserDBForm
    email_subject = email_subject

    @expose('/activation/<string:activation_hash>')
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
        user = self.appbuilder.sm.add_user(username=reg.email,
                                           email=reg.email,
                                           first_name=reg.first_name,
                                           last_name=reg.last_name,
                                           role=self.appbuilder.sm.find_role(
                                               self.appbuilder.sm.auth_user_registration_role),
                                           password=reg.password)
        if not user:
            flash(as_unicode(self.error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        else:
            org_reg = self.appbuilder.sm.add_org(reg, user)
            # aws_info = post_request('https://3ozse3mao8.execute-api.ap-southeast-2.amazonaws.com/test/createorg',
            #                         {"OrgName": org_reg.organization_name, "OrgID": org_reg.id})
            # self.handle_aws_info(aws_info)
            self.appbuilder.sm.del_register_user(reg)
            return self.render_template(self.activation_template,
                                        username=reg.email,
                                        first_name=reg.first_name,
                                        last_name=reg.last_name,
                                        appbuilder=self.appbuilder)

    def add_form_unique_validations(self, form):
        datamodel_user = self.appbuilder.sm.get_user_datamodel
        datamodel_register_user = self.appbuilder.sm.get_register_user_datamodel
        if len(form.email.validators) == 2:
            form.email.validators.append(Unique(datamodel_user, 'email'))
            form.email.validators.append(Unique(datamodel_register_user, 'email'))

    def handle_aws_info(self, info):
        access_key = info['AccessKeyId']
        secret_key = info['SecretAccessKey']
        athena_link = f'awsathena+jdbc:{access_key}:{secret_key}@athena.us-west-2.amazonaws.com/market_report_prod_ore?s3_staging_dir=s3://druid.dts.input-bucket.oregon'

    def form_post(self, form):
        self.add_form_unique_validations(form)
        self.add_registration_org_admin(organizaiton=form.organization.data,
                                        first_name=form.first_name.data,
                                        last_name=form.last_name.data,
                                        email=form.email.data,
                                        password=form.password.data)

    def add_registration_org_admin(self, organizaiton, first_name, last_name, email, password=''):
        """
            Add a registration request for the user.

        :rtype : RegisterUser
        """
        register_user = self.appbuilder.sm.add_register_user_org_admin(organizaiton, first_name, last_name, email,
                                                                       password)
        if register_user:
            if self.send_email(register_user):
                flash(as_unicode(self.message), 'info')
                return register_user
            else:
                flash(as_unicode(self.error_message), 'danger')
                self.appbuilder.sm.del_register_user(register_user)
                return None

    def send_email(self, register_user):
        """
            Method for sending the registration Email to the user
        """
        try:
            from flask_mail import Mail, Message
        except:
            log.error("Install Flask-Mail to use User registration")
            return False
        mail = Mail(self.appbuilder.get_app)
        msg = Message()
        msg.subject = self.email_subject
        url = url_for('.activation', _external=True, activation_hash=register_user.registration_hash)
        msg.html = self.render_template(self.email_template,
                                        url=url,
                                        first_name=register_user.first_name,
                                        last_name=register_user.last_name)
        msg.recipients = [register_user.email]
        try:
            mail.send(msg)
        except Exception as e:
            log.error("Send email exception: {0}".format(str(e)))
            return False
        return True
    # username = 'Colin'
    # password = 'pa55word'
    # email = 'chenyang.wang@zawee.work'
    # family_name = 'Wang'
    # given_name = 'Chenyang'
    # role = 'admin'
    # organisation = 'Colin23'

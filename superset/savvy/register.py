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
from flask import g
from flask_appbuilder import expose, const
from flask_appbuilder.security.decorators import has_access
from flask_appbuilder.security.registerviews import RegisterUserDBView, BaseRegisterUser
from flask_appbuilder.security.forms import DynamicForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget, BS3PasswordFieldWidget
from flask_appbuilder._compat import as_unicode
from wtforms import StringField, PasswordField, SelectField
from flask_babel import lazy_gettext
from flask import flash, redirect, url_for

from superset.savvy.savvy_views import RegisterInvitationForm, log
from ..utils.core import post_request
from sqlalchemy import and_, create_engine

from wtforms.validators import DataRequired, EqualTo, Email
from flask_appbuilder.validators import Unique


import logging
import json

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
    role = SelectField(label=lazy_gettext('Invitation Role'))
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()], widget=BS3TextFieldWidget())
    # inviter_id = HiddenField(lazy_gettext('Inviter'))
    # organization = HiddenField(lazy_gettext('Organization'))


class SavvyRegisterInvitationUserDBView(RegisterUserDBView):
    redirect_url = '/'
    form = SavvyRegisterInvitationUserDBForm
    msg = 'Invitation has been sent to the email.'
    email_subject = 'Invitation Registration'

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
        url = self.appbuilder.sm.get_url_for_invitation(register_user.registration_hash)
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

    @expose('/invite')
    @has_access
    def invitation(self):
        self._init_vars()
        form = self.form.refresh()
        form.role.choices = self.appbuilder.sm.find_invite_roles(g.user.id)
        # print(form.role.choices)
        widgets = self._get_edit_widget(form=form)
        self.update_redirect()
        return self.render_template(self.form_template,
                                    title=self.form_title,
                                    widgets=widgets,
                                    appbuilder=self.appbuilder
                                    )

    @expose('/invite', methods=['POST'])
    @has_access
    def invitation_post(self):
        form = self.form.refresh()
        form.role.choices = self.appbuilder.sm.find_invite_roles(g.user.id)
        if form.validate_on_submit():
            user_id = g.user.id
            organization = self.appbuilder.sm.find_org(user_id=user_id)
            reg_user = self.appbuilder.sm.add_invite_register_user(email=form.email.data,
                                                                   organization=organization.organization_name,
                                                                   role=form.role.data,
                                                                   inviter=user_id)
            if reg_user:
                if self.send_email(reg_user):
                    flash(as_unicode('Invitation sent to %s' % form.email.data), 'info')
                    return self.invitation()
        else:
            return self.invitation()


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

        if not reg:
            log.error(const.LOGMSG_ERR_SEC_NO_REGISTER_HASH.format(activation_hash))
            flash(as_unicode(self.false_error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        user = self.appbuilder.sm.add_user(username=reg.email,
                                           email=reg.email,
                                           first_name=reg.first_name,
                                           last_name=reg.last_name,
                                           role=self.appbuilder.sm.find_role('org_owner'),
                                           hashed_password=reg.password)
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

    @expose('/here/')
    def handle_aws_info(self, info=None):
        # info = post_request('https://3ozse3mao8.execute-api.ap-southeast-2.amazonaws.com/test/createorg',{"org_name": "theFirstone1111", "org_id": "1111111"})
        # aws_info = json.loads(info.text)
        # access_key = aws_info['AccessKeyId']
        # secret_key = aws_info['SecretAccessKey']

        access_key = 'AKIAIRQFEHI3X7KAETYA'
        secret_key = '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'

        athena_link = f'awsathena+jdbc://{access_key}:{secret_key}@athena.us-west-2.amazonaws.com/market_report_prod_ore?s3_staging_dir=s3://druid.dts.input-bucket.oregon'
        print(athena_link)
        self.testconn(athena_link)

    def testconn(self, athena_link):
        """Tests a sqla connection"""
        from ..views.base import json_error_response
        try:
            engine = create_engine(athena_link)
            engine.connect()
            table_list = engine.table_names()
            print(table_list)
        except Exception as e:
            logging.exception(e)
            return json_error_response((
                'Connection failed!\n\n'
                'The error message returned was:\n{}').format(e))

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


class SavvyRegisterInviteView(BaseRegisterUser):
    form = RegisterInvitationForm

    email_template = 'appbuilder/general/security/register_mail.html'
    email_subject =  'SavvyBI - Register'

    def send_email(self, register_user):
        """
            Method for sending the registration Email to the user
        """
        try:
            from flask_mail import Mail, Message
        except Exception:
            log.error('Install Flask-Mail to use User registration')
            return False
        mail = Mail(self.appbuilder.get_app)
        msg = Message()
        msg.subject = self.email_subject
        url = url_for('.activate', _external=True, invitation_hash=register_user.registration_hash)
        print(url)
        msg.html = self.render_template(self.email_template,
                                        url=url)
        msg.recipients = [register_user.email]
        try:
            mail.send(msg)
        except Exception as e:
            log.error('Send email exception: {0}'.format(str(e)))
            return False
        return True

    @expose('/invitation/<string:invitation_hash>', methods=['GET'])
    def invitation(self, invitation_hash):
        """End point for registration by invitation"""
        self._init_vars()
        form = self.form.refresh()
        # Find org inviter and email by invitation hash
        org_name, inviter, email, role = self.appbuilder.sm.find_invite_hash(invitation_hash)
        if email is not None:
            form.email.data = email
            form.organization.data = org_name
            form.inviter.data = inviter
            form.role.data = role
            widgets = self._get_edit_widget(form=form)
            self.update_redirect()
            return self.render_template(self.form_template,
                                        title=self.form_title,
                                        widgets=widgets,
                                        appbuilder=self.appbuilder)
        else:
            flash('Unable to find valid invitation.', 'danger')
        return redirect(self.appbuilder.get_url_for_index)

    def edit_invited_register_user(self, form, invitation_hash):
        register_user = self.appbuilder.sm.edit_invite_register_user_by_hash(invitation_hash,
                                                                             first_name=form.first_name.data,
                                                                             last_name=form.last_name.data,
                                                                             password=form.password.data,
                                                                             )
        if register_user:
            if self.send_email(register_user):
                flash(as_unicode(self.message), 'info')
                return self.appbuilder.get_url_for_index
            else:
                flash(as_unicode(self.error_message), 'danger')
                self.appbuilder.sm.del_register_user(register_user)
                return None

    @expose('/invitation/<string:invitation_hash>', methods=['POST'])
    def invite_register(self, invitation_hash):
        """End point for registration by invitation"""
        form = self.form.refresh()

        if form.validate_on_submit() and self.appbuilder.sm.find_register_user(invitation_hash):
            response = self.edit_invited_register_user(form, invitation_hash)
            if not response:
                return redirect(self.appbuilder.get_url_for_index)
            return redirect(response)
        else:
            widgets = self._get_edit_widget(form=form)
            return self.render_template(
                self.form_template,
                title=self.form_title,
                widgets=widgets,
                appbuilder=self.appbuilder,
            )

    @expose('/activate/<string:invitation_hash>')
    def activate(self, invitation_hash):
        reg = self.appbuilder.sm.find_register_user(invitation_hash)
        if not reg:
            flash(as_unicode(self.false_error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        if not self.appbuilder.sm.add_org_user(email=reg.email,
                                               first_name=reg.first_name,
                                               last_name=reg.last_name,
                                               role_id=reg.role_assigned,
                                               organization=reg.organization,
                                               hashed_password=reg.password):
            flash(as_unicode(self.error_message), 'danger')
            return redirect(self.appbuilder.get_url_for_index)
        else:
            self.appbuilder.sm.del_register_user(reg)
            return self.render_template(self.activation_template,
                                        username=reg.email,
                                        first_name=reg.first_name,
                                        last_name=reg.last_name,
                                        appbuilder=self.appbuilder)

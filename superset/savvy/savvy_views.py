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
import logging

from flask import flash, redirect, request, url_for
from flask_appbuilder._compat import as_unicode
from flask_appbuilder.fieldwidgets import BS3PasswordFieldWidget, BS3TextFieldWidget
from flask_appbuilder.security.forms import DynamicForm, ResetPasswordForm
from flask_appbuilder.security.registerviews import BaseRegisterUser
from flask_appbuilder.views import expose, PublicFormView
from flask_babel import lazy_gettext
from wtforms import StringField, PasswordField, HiddenField
from wtforms.validators import DataRequired, Email, EqualTo

log = logging.getLogger(__name__)


class PasswordRecoverForm(DynamicForm):
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()])


class RegisterInvitationForm(DynamicForm):
    organization = StringField(lazy_gettext('Organization'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    inviter = StringField(lazy_gettext('Inviter'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    role = StringField(lazy_gettext('Role'), widget=BS3TextFieldWidget(), render_kw={'readonly': True})
    first_name = StringField(lazy_gettext('First Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())
    last_name = StringField(lazy_gettext('Last Name'), validators=[DataRequired()], widget=BS3TextFieldWidget())
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()], widget=BS3TextFieldWidget())
    password = PasswordField(lazy_gettext('Password'),
                             description=lazy_gettext(
                                 'Please use a good password policy, this application does not check this for you'),
                             validators=[DataRequired()],
                             widget=BS3PasswordFieldWidget())
    conf_password = PasswordField(lazy_gettext('Confirm Password'),
                                  description=lazy_gettext('Please rewrite the password to confirm'),
                                  validators=[EqualTo('password', message=lazy_gettext('Passwords must match'))],
                                  widget=BS3PasswordFieldWidget())


class EmailResetPasswordView(PublicFormView):
    route_base = '/reset'
    form = ResetPasswordForm
    form_title = lazy_gettext('Reset Password Form')
    redirect_url = '/'
    message = lazy_gettext('Password Changed')

    @expose('/form', methods=['GET'])
    def this_form_get(self):
        self._init_vars()
        form = self.form.refresh()
        token = request.args.get('token')
        user = self.appbuilder.sm.find_user_by_token(token)
        if user is not None:
            self.form_get(form)
            widgets = self._get_edit_widget(form=form)
            self.update_redirect()
            return self.render_template(self.form_template,
                                        title=self.form_title,
                                        widgets=widgets,
                                        appbuilder=self.appbuilder)
        return redirect(self.appbuilder.get_url_for_index)

    @expose('/form', methods=['POST'])
    def this_form_post(self):
        self._init_vars()
        form = self.form.refresh()
        if form.validate_on_submit():
            token = request.args.get('token')
            response = self.form_post(form, token)
            if not response:
                return self.this_form_get()
            return redirect(response)
        else:
            widgets = self._get_edit_widget(form=form)
            return self.render_template(
                self.form_template,
                title=self.form_title,
                widgets=widgets,
                appbuilder=self.appbuilder,
            )

    def form_post(self, form, token):
        user = self.appbuilder.sm.find_user_by_token(token)
        if user is not None:
            flash(as_unicode(self.message), 'info')
            password = form.password.data
            self.appbuilder.sm.reset_password(user.id, password)
            self.appbuilder.sm.set_token_used(token)
            return self.appbuilder.get_url_for_index
        return None


class PasswordRecoverView(PublicFormView):
    """
        This is the view for recovering password
    """

    route_base = '/recover'

    email_template = 'appbuilder/general/security/recover_mail.html'
    """ The template used to generate the email sent to the user """

    email_subject = lazy_gettext('Change your password')
    """ The email subject sent to the user """

    message = lazy_gettext('Password reset link sent to your email')
    """ The message shown on a successful registration """

    error_message = lazy_gettext('This email is not registered or confirmed yet.')
    """ The message shown on an unsuccessful registration """

    form_title = lazy_gettext('Enter your registered email for recovery')
    """ The form title """

    form = PasswordRecoverForm

    def send_email(self, email, hash):
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
        url = url_for('.reset', _external=True, reset_hash=hash)
        print(url)
        msg.html = self.render_template(self.email_template,
                                        url=url)
        msg.recipients = [email]
        try:
            mail.send(msg)
        except Exception as e:
            log.error('Send email exception: {0}'.format(str(e)))
            return False
        return True

    def add_password_reset(self, email):
        reset_hash = self.appbuilder.sm.add_reset_request(email)
        if reset_hash is not None:
            flash(as_unicode(self.message), 'info')
            self.send_email(email, reset_hash)
            return redirect(self.appbuilder.get_url_for_index)
        else:
            flash(as_unicode(self.error_message), 'danger')
            return None

    @expose('/reset/<string:reset_hash>')
    def reset(self, reset_hash):
        """ This is end point to verify the reset password hash from user
        """
        if reset_hash is not None:
            return redirect(self.appbuilder.sm.get_url_for_reset(token=reset_hash))

    def form_post(self, form):
        return self.add_password_reset(email=form.email.data)


class InviteRegisterView(BaseRegisterUser):
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
    def find_register(self, invitation_hash):
        """End point for registration by invitation"""
        self._init_vars()
        form = self.form.refresh()
        # Find org inviter and email by invitation hash
        org_name, inviter, email, role = self.appbuilder.sm.find_invite_hash(invitation_hash)
        if email is not None:
            print(org_name, inviter, email)
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
        return redirect(self.appbuilder.get_url_for_index)

    def add_invited_register_user(self, form, invitation_hash):
        register_user = self.appbuilder.sm.add_invite_register_user(first_name=form.first_name.data,
                                                                    last_name=form.last_name.data,
                                                                    email=form.email.data,
                                                                    password=form.password.data,
                                                                    organization=form.organization.data,
                                                                    role=form.role.data,
                                                                    inviter=form.inviter.data,
                                                                    hash=invitation_hash)
        if register_user:
            if self.send_email(register_user):
                return self.appbuilder.get_url_for_index
            else:
                self.appbuilder.sm.del_register_user(register_user)
                return None

    @expose('/invitation/<string:invitation_hash>', methods=['POST'])
    def invite_register(self, invitation_hash):
        """End point for registration by invitation"""
        self._init_vars()
        form = self.form.refresh()

        # Check invitation hash

        if form.validate_on_submit():
            response = self.add_invited_register_user(form, invitation_hash)
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
        print(invitation_hash)
        reg = self.appbuilder.sm.find_invite_register_user(invitation_hash)
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
                                        username=reg.username,
                                        first_name=reg.first_name,
                                        last_name=reg.last_name,
                                        appbuilder=self.appbuilder)


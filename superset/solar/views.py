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
import os
import logging
import stripe

from flask import flash, redirect, url_for, g, request, make_response, Markup, jsonify
from flask_appbuilder import has_access
from flask_babel import lazy_gettext
from flask_mail import Mail, Message
from flask_login import login_user

from flask_appbuilder.views import expose, PublicFormView
from flask_appbuilder.security.forms import ResetPasswordForm
from .models import SolarBIUser, TeamRegisterUser, Plan
from mailchimp3 import MailChimp
from mailchimp3.mailchimpclient import MailChimpError

from .utils import set_session_team, update_mp_user, log_to_mp


from .forms import (
    SolarBILoginForm_db,
    SolarBIPasswordRecoverForm,
    SolarBIPasswordRecoverFormWidget,
    SolarBIPasswordResetFormWidget,
    SolarBIPasswordResetForm,
    SolarBIUserInfoEditForm,
    SolarBIIUserInfoEditWidget,
    SolarBIResetMyPasswordWidget,
)
from flask_appbuilder._compat import as_unicode

from flask_appbuilder.security.views import AuthDBView, UserInfoEditView, ResetMyPasswordView


log = logging.getLogger(__name__)


class SolarBIAuthDBView(AuthDBView):
    invalid_login_message = lazy_gettext("Email/Username or password incorrect. Please try again.")
    # inactivated_login_message = lazy_gettext("Your account has not been activated yet. Please check your email.")
    inactivated_login_message = Markup("<span>Your account has not been activated yet. Please check your email.</span>"
                                       "<span class='resend-activation'>Not received the email?"
                                       "<a class='rae-btn'>Resend</a></span>")

    login_template = "appbuilder/general/security/solarbi_login_db.html"
    email_template = 'appbuilder/general/security/account_activation_mail.html'

    @expose("/login/", methods=["GET", "POST"])
    def login(self):
        if g.user is not None and g.user.is_authenticated:
            return redirect(self.appbuilder.get_url_for_index)
        form = SolarBILoginForm_db()
        if form.validate_on_submit():
            user = self.appbuilder.sm.auth_solarbi_user_db(
                form.username.data, form.password.data
            )
            if not user:
                # For team member, check if they have activated their accounts yet
                reg_user = self.appbuilder.get_session.query(TeamRegisterUser).\
                    filter_by(username=form.username.data).first()
                if not reg_user:
                    reg_user = self.appbuilder.get_session.query(TeamRegisterUser).\
                        filter_by(email=form.username.data).first()
                if reg_user:
                    flash(self.inactivated_login_message, "warning")
                    return redirect(self.appbuilder.get_url_for_login)

                flash(as_unicode(self.invalid_login_message), "warning")
                return redirect(self.appbuilder.get_url_for_login)

            # For team admin, check if they have activated their accounts
            curr_user = self.appbuilder.get_session.query(SolarBIUser).filter_by(username=form.username.data).first()
            if not curr_user:
                curr_user = self.appbuilder.get_session.query(SolarBIUser).filter_by(email=form.username.data).first()
            if curr_user and not curr_user.email_confirm:
                flash(self.inactivated_login_message, "warning")
                return redirect(self.appbuilder.get_url_for_login)

            remember = form.remember_me.data
            login_user(user, remember=remember)

            team = self.appbuilder.sm.find_team(user_id=g.user.id)
            for role in user.roles:
                if role.name == 'Admin':
                    return redirect(self.appbuilder.get_url_for_index)
            set_session_team(team.id, team.team_name)

            log_to_mp(user, team.team_name, 'login', {})

            return redirect(self.appbuilder.get_url_for_index)
        return self.render_template(
            self.login_template, title=self.title, form=form, appbuilder=self.appbuilder
        )

    @expose('/resend-activation', methods=['POST'])
    def resend_activation(self):
        user_email = request.json['user_email']
        register_user = self.appbuilder.sm.get_registered_user(user_email)
        if not register_user:
            return jsonify(dict(err="Sorry we cannot find the email"))

        mail = Mail(self.appbuilder.get_app)
        msg = Message()
        msg.sender = 'SolarBI', 'no-reply@solarbi.com.au'

        # is None -> team admin
        if register_user.inviter is None:
            msg.subject = 'SolarBI - Team Created Confirmation'
            url = url_for('SolarBIRegisterUserDBView.activation',
                          _external=True,
                          activation_hash=register_user.registration_hash)
        else:
            msg.subject = 'SolarBI - Team Member Activation'
            url = url_for('SolarBIRegisterInvitationView.activate',
                          _external=True,
                          invitation_hash=register_user.registration_hash)

        msg.html = self.render_template(self.email_template,
                                        url=url,
                                        username=register_user.username)
        msg.recipients = [register_user.email]
        try:
            mail.send(msg)
        except Exception as e:
            log.error('Send email exception: {0}'.format(str(e)))
            flash(as_unicode("Snd email exception: " + str(e)), 'danger')
            return jsonify(dict(redirect='/login'))

        flash(as_unicode("Resend activation email success. Please check your email."), 'info')
        return jsonify(dict(redirect='/login'))


class SolarBIPasswordRecoverView(PublicFormView):
    """
        This is the view for recovering password
    """

    route_base = '/password-recover'

    email_template = 'appbuilder/general/security/password_recover_mail.html'
    """ The template used to generate the email sent to the user """

    email_subject = lazy_gettext('SolarBI - Reset Your Password')
    """ The email subject sent to the user """

    message = lazy_gettext('Password reset link sent to your email')
    """ The message shown on a successful registration """

    error_message = lazy_gettext('This email is not registered or confirmed yet.')
    """ The message shown on an unsuccessful registration """

    form = SolarBIPasswordRecoverForm
    edit_widget = SolarBIPasswordRecoverFormWidget
    form_template = 'appbuilder/general/security/recover_password_form_template.html'

    def send_email(self, email, hash_val):
        """
            Method for sending the registration Email to the user
        """
        mail = Mail(self.appbuilder.get_app)
        msg = Message()
        msg.sender = 'SolarBI', 'no-reply@solarbi.com.au'
        msg.subject = self.email_subject
        url = url_for('.reset', _external=True, reset_hash=hash_val)
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
            return redirect(self.appbuilder.get_url_for_index)

    @expose('/reset/<string:reset_hash>')
    def reset(self, reset_hash):
        """ This is end point to verify the reset password hash from user
        """
        if reset_hash is not None:
            return redirect(self.appbuilder.sm.get_url_for_reset(token=reset_hash))

    def form_post(self, form):
        return self.add_password_reset(email=form.email.data)


class SolarBIResetPasswordView(PublicFormView):
    route_base = '/reset'
    form = SolarBIPasswordResetForm
    form_template = 'appbuilder/general/security/reset_password_form_template.html'
    edit_widget = SolarBIPasswordResetFormWidget
    redirect_url = '/'
    message = lazy_gettext('Password has been reset.')
    error_message = lazy_gettext('Sorry, the link has expired.')

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
        flash(as_unicode(self.error_message), 'danger')
        return redirect(self.appbuilder.get_url_for_index)

    @expose('/form', methods=['POST'])
    def this_form_post(self):
        self._init_vars()
        form = self.form.refresh()
        if form.validate_on_submit():
            token = request.args.get('token')
            response = self.form_post(form, token=token)
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

    def form_post(self, form, **kwargs):
        token = kwargs['token']
        user = self.appbuilder.sm.find_user_by_token(token)

        if user is not None:
            flash(as_unicode(self.message), 'info')
            password = form.password.data
            self.appbuilder.sm.reset_password(user.id, password)
            self.appbuilder.sm.set_token_used(token)
            return self.appbuilder.get_url_for_index

        return None


class SolarBIUserInfoEditView(UserInfoEditView):
    form_title = 'My Profile - SolarBI'
    form = SolarBIUserInfoEditForm
    form_template = 'appbuilder/general/security/edit_user_info.html'
    edit_widget = SolarBIIUserInfoEditWidget
    mc_client = MailChimp(mc_api=os.environ['MC_API_KEY'], mc_user='solarbi')
    message = "Profile information has been successfully updated"

    def form_get(self, form):
        item = self.appbuilder.sm.get_user_by_id(g.user.id)
        # fills the form generic solution
        for key, value in form.data.items():
            if key == "csrf_token":
                continue

            if key == "subscription":
                if not self.is_in_mc():
                    self.create_user_in_mc(g.user.email, g.user.first_name, g.user.last_name)

                form_field = getattr(form, key)
                form_field.data = self.is_subscribed()
                continue

            form_field = getattr(form, key)
            form_field.data = getattr(item, key)

    @expose("/form", methods=["POST"])
    @has_access
    def this_form_post(self):
        self._init_vars()
        form = self.form.refresh()

        if form.validate_on_submit():
            response = self.form_post(form)
            if not response:
                return redirect("/solarbiuserinfoeditview/form")
            return response
        else:
            flash(as_unicode('The new email address has already been used.'), 'danger')
            return redirect('/solarbiuserinfoeditview/form')

    def form_post(self, form):
        self.message = "Profile information has been successfully updated"
        form = self.form.refresh(request.form)
        item = self.appbuilder.sm.get_user_by_id(g.user.id)

        # Update Mailchimp if any user field changes
        if form.email.data != item.email:
            subscriber_hash = self.get_email_md5(item.email)
            self.mc_client.lists.members.delete(list_id='0e2cd7f0f5', subscriber_hash=subscriber_hash)
            # Handle the case that the user changes back to the old manually-unsubscribed and archived email address
            try:
                self.create_user_in_mc(form.email.data, form.first_name.data, form.last_name.data)
            except MailChimpError as e:
                self.update_user_sub_status(form.email.data, 'pending')
                self.message = "Due to compliance restriction, please manually accept the opt-in " \
                               "email sent to " + form.email.data + "."
        if form.email.data == item.email and \
                (form.first_name.data != item.first_name or form.last_name.data != item.last_name):
            self.mc_client.lists.members.update(list_id='0e2cd7f0f5',
                                                subscriber_hash=self.get_email_md5(form.email.data),
                                                data={'merge_fields': {'FNAME': form.first_name.data,
                                                                       'LNAME': form.last_name.data}})

        # If users do NOT change their email but ONLY change the subscription status
        if form.subscription.data != self.is_subscribed() and form.email.data == item.email:
            if form.subscription.data:
                try:
                    self.update_user_sub_status(g.user.email, 'subscribed')
                except MailChimpError as e:
                    self.update_user_sub_status(g.user.email, 'pending')
                    self.message = "Due to compliance restriction, please manually accept the opt-in " \
                                   "email sent to " + form.email.data + "."
            else:
                self.update_user_sub_status(g.user.email, 'unsubscribed')

        form.username.data = item.username
        form.populate_obj(item)
        self.appbuilder.sm.update_user(item)
        update_mp_user(g.user)

        # If current user is team admin, update the stripe email for his/her team.
        for team_role in g.user.team_role:
            if team_role.role.name == 'team_owner':
                logging.info('Updating email for team {}'.format(team_role.team.team_name))
                stripe.Customer.modify(team_role.team.stripe_user_id, email=g.user.email)

        if 'compliance' in self.message:
            flash(as_unicode(self.message), "warning")
        else:
            flash(as_unicode(self.message), "info")

    def is_in_mc(self):
        email_md5 = self.get_email_md5(g.user.email)
        try:
            _ = self.mc_client.lists.members.get(list_id='0e2cd7f0f5', subscriber_hash=email_md5)
            return True
        except MailChimpError as e:
            return False

    def is_subscribed(self):
        email_md5 = self.get_email_md5(g.user.email)
        try:
            list_member = self.mc_client.lists.members.get(list_id='0e2cd7f0f5', subscriber_hash=email_md5)
            is_subscribed = list_member['status'] == 'subscribed'
        except MailChimpError as e:
            is_subscribed = False

        return is_subscribed

    def create_user_in_mc(self, email, first_name, last_name):
        self.mc_client.lists.members.create(list_id='0e2cd7f0f5', data={
            'email_address': email,
            'status': 'subscribed',
            'merge_fields': {
                'FNAME': first_name,
                'LNAME': last_name,
            },
        })

    def update_user_sub_status(self, email, status):
        self.mc_client.lists.members.update(list_id='0e2cd7f0f5',
                                            subscriber_hash=self.get_email_md5(email),
                                            data={'status': status})

    def get_email_md5(self, email):
        import hashlib

        email_md5 = hashlib.md5(email.encode()).hexdigest()
        return email_md5


class SolarBIResetMyPasswordView(ResetMyPasswordView):
    form_template = 'appbuilder/general/security/reset_my_password.html'
    edit_widget = SolarBIResetMyPasswordWidget

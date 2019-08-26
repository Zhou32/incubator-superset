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

from flask import flash, redirect, url_for, g, request, make_response
from flask_babel import lazy_gettext
from flask_mail import Mail, Message
from flask_login import login_user

from flask_appbuilder.views import expose, PublicFormView, ModelView

from .forms import SolarBILoginForm_db, SolarBIPasswordRecoverForm, \
    SolarBIPasswordRecoverFormWidget
from flask_appbuilder._compat import as_unicode

from flask_appbuilder.security.views import AuthDBView


log = logging.getLogger(__name__)


class SolarBIAuthDBView(AuthDBView):
    login_template = "appbuilder/general/security/solarbi_login_db.html"
    @expose("/login/", methods=["GET", "POST"])
    def login(self):
        if g.user is not None and g.user.is_authenticated:
            return redirect(self.appbuilder.get_url_for_index)
        form = SolarBILoginForm_db()
        if form.validate_on_submit():
            user = self.appbuilder.sm.auth_user_db(
                form.username.data, form.password.data
            )
            if not user:
                flash(as_unicode(self.invalid_login_message), "warning")
                return redirect(self.appbuilder.get_url_for_login)

            remember = form.remember_me.data
            login_user(user, remember=remember)
            return redirect(self.appbuilder.get_url_for_index)
        return self.render_template(
            self.login_template, title=self.title, form=form, appbuilder=self.appbuilder
        )


class SolarBIPasswordRecoverView(PublicFormView):
    """
        This is the view for recovering password
    """

    route_base = '/password-recover'

    email_template = 'appbuilder/general/security/recover_mail.html'
    """ The template used to generate the email sent to the user """

    email_subject = lazy_gettext('Change your password')
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
            return None

    @expose('/reset/<string:reset_hash>')
    def reset(self, reset_hash):
        """ This is end point to verify the reset password hash from user
        """
        if reset_hash is not None:
            return redirect(self.appbuilder.sm.get_url_for_reset(token=reset_hash))

    def form_post(self, form):
        return self.add_password_reset(email=form.email.data)
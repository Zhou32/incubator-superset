from flask_appbuilder.views import PublicFormView, SimpleFormView,  expose
from flask_appbuilder._compat import as_unicode
from flask_babel import lazy_gettext
from flask_appbuilder.security.forms import DynamicForm
from flask import flash, redirect, url_for, request
from flask_appbuilder.fieldwidgets import BS3PasswordFieldWidget
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Email, EqualTo

import logging

log = logging.getLogger(__name__)


class PasswordRecoverForm(DynamicForm):
    email = StringField(lazy_gettext('Email'), validators=[DataRequired(), Email()])


class PasswordResetForm(DynamicForm):
    password = PasswordField(lazy_gettext('Password'),
                             validators=[DataRequired()],
                             widget=BS3PasswordFieldWidget())
    conf_password = PasswordField(lazy_gettext('Confirm Password'),
                                  validators=[DataRequired(), EqualTo('password', message=lazy_gettext('Passwords must match'))],
                                  widget=BS3PasswordFieldWidget())



class EmailResetPasswordView(PublicFormView):
    route_base = '/reset'

    form = PasswordResetForm
    form_title = lazy_gettext('Reset Password Form')
    redirect_url = '/'
    message = lazy_gettext('Password Changed')

    @expose("/form", methods=['GET'])
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
        print('not found')
        return redirect(self.appbuilder.get_url_for_index)

    @expose("/form", methods=['POST'])
    def this_form_post(self):
        self._init_vars()
        form = self.form.refresh()
        if form.validate_on_submit():
            token = request.args.get('token')
            response = self.form_post(form,token)
            if not response:
                return self.this_form_get()
            return redirect(response)
        else:
            widgets = self._get_edit_widget(form=form)
            return self.render_template(
                self.form_template,
                title=self.form_title,
                widgets=widgets,
                appbuilder=self.appbuilder
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
            log.error("Install Flask-Mail to use User registration")
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
            log.error("Send email exception: {0}".format(str(e)))
            return False
        return True

    def add_password_reset(self, email):
        reset_hash = self.appbuilder.sm.add_reset_request(email)
        if reset_hash is not None:
            flash(as_unicode(self.message), 'info')
            self.send_email(email, reset_hash)
            return redirect('/')
        else:
            flash(as_unicode(self.error_message), 'danger')
            return None

    @expose('/reset/<string:reset_hash>')
    def reset(self, reset_hash):
        """ This is end point to verify the reset password hash from user
            TODO
        """
        if reset_hash is not None:
            return redirect(self.appbuilder.sm.get_url_for_reset(token=reset_hash))

    def form_get(self, form):
        self.add_form_unique_validations(form)

    def form_post(self, form):
        self.add_form_unique_validations(form)
        return self.add_password_reset(email=form.email.data)

    @expose("/form", methods=['POST'])
    def this_form_post(self):
        self._init_vars()
        form = self.form.refresh()
        if form.validate_on_submit():
            response = self.form_post(form)
            if not response:
                return self.this_form_get()
            return response
        else:
            widgets = self._get_edit_widget(form=form)
            return self.render_template(
                self.form_template,
                title=self.form_title,
                widgets=widgets,
                appbuilder=self.appbuilder
            )

    def add_form_unique_validations(self, form):
        return





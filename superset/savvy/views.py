import logging

from flask import flash, redirect, request, url_for, g
from flask_babel import lazy_gettext
from flask_mail import Mail, Message
from sqlalchemy import create_engine

from flask_appbuilder import const
from flask_appbuilder.validators import Unique
from flask_appbuilder._compat import as_unicode
from flask_appbuilder.views import expose, PublicFormView
from flask_appbuilder.security.decorators import has_access
from flask_appbuilder.security.forms import ResetPasswordForm
from flask_appbuilder.security.views import UserDBModelView
from flask_appbuilder.security.registerviews import RegisterUserDBView, BaseRegisterUser
from .fitlers import OrgFilter
from .forms import (
    PasswordRecoverForm, SavvyRegisterInvitationUserDBForm, SavvyRegisterUserDBForm, RegisterInvitationForm
)

log = logging.getLogger(__name__)
email_subject = 'SavvyBI - Email Confirmation'


class SavvyUserDBModelView(UserDBModelView):

    base_filters = [['id', OrgFilter, lambda: []]]

    def pre_delete(self, user):
        print(user)
        organization = self.appbuilder.sm.find_org(user_id=user.id)
        if len(organization.users) == 1:
            self.appbuilder.sm.delete_org(organization)


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

    def send_email(self, email, hash_val):
        """
            Method for sending the registration Email to the user
        """
        mail = Mail(self.appbuilder.get_app)
        msg = Message()
        msg.subject = self.email_subject
        url = url_for('.reset', _external=True, reset_hash=hash_val)
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


class SavvyRegisterInvitationUserDBView(RegisterUserDBView):
    redirect_url = '/'
    form = SavvyRegisterInvitationUserDBForm
    msg = 'Invitation has been sent to the email.'
    email_subject = 'Invitation Registration'

    def send_email(self, register_user):
        """
            Method for sending the registration Email to the user
        """
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

    def add_form_unique_validations(self, form):
        datamodel_user = self.appbuilder.sm.get_user_datamodel
        datamodel_register_user = self.appbuilder.sm.get_register_user_datamodel
        if len(form.email.validators) == 2:
            form.email.validators.append(Unique(datamodel_user, 'email'))
            form.email.validators.append(Unique(datamodel_register_user, 'email'))

    @expose('/invite', methods=['GET'])
    @has_access
    def invitation(self):
        self._init_vars()
        form = self.form.refresh()
        form.role.choices = self.appbuilder.sm.find_invite_roles(g.user.id)
        widgets = self._get_edit_widget(form=form)
        self.update_redirect()
        self.add_form_unique_validations(form)
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
        self.add_form_unique_validations(form)
        if form.validate_on_submit():
            user_id = g.user.id
            organization = self.appbuilder.sm.find_org(user_id=user_id)
            reg_user = self.appbuilder.sm.add_invite_register_user(email=form.email.data,
                                                                   organization=organization,
                                                                   role=form.role.data,
                                                                   inviter=user_id)
            if reg_user:
                if self.send_email(reg_user):
                    flash(as_unicode('Invitation sent to %s' % form.email.data), 'info')
                    return self.invitation()
                else:
                    flash(as_unicode('Cannot send invitation to user'), 'danger')
                    return self.invitation()
            else:
                flash(as_unicode('Superuser reaches limit.'), 'danger')
                return self.invitation()
        else:
            widgets = self._get_edit_widget(form=form)
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
            self.appbuilder.sm.del_register_user(reg)
            return self.render_template(self.activation_template,
                                        username=reg.email,
                                        first_name=reg.first_name,
                                        last_name=reg.last_name,
                                        appbuilder=self.appbuilder)

    def add_form_unique_validations(self, form):
        datamodel_user = self.appbuilder.sm.get_user_datamodel
        datamodel_register_user = self.appbuilder.sm.get_register_user_datamodel
        datamodel_organization = self.appbuilder.sm.get_organization_datamodel()
        if len(form.email.validators) == 2:
            form.email.validators.append(Unique(datamodel_user, 'email'))
            form.email.validators.append(Unique(datamodel_register_user, 'email'))
        if len(form.organization.validators) == 1:
            form.organization.validators.append(Unique(datamodel_organization, 'organization_name'))

    @expose('/here/')
    def handle_aws_info(self):
        access_key = 'AKIAIRQFEHI3X7KAETYA'
        secret_key = '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'

        athena_link = f'awsathena+jdbc://{access_key}:{secret_key}@athena.us-west-2.amazonaws.com/' \
                      f'market_report_prod_ore?s3_staging_dir=s3://druid.dts.input-bucket.oregon'
        self.testconn(athena_link)

    @staticmethod
    def testconn(athena_link):
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
    email_subject = 'SavvyBI - Register'

    def send_email(self, register_user):
        """
            Method for sending the registration Email to the user
        """
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

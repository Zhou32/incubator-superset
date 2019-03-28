import json
import logging
import time

from flask import flash, redirect, request, url_for, g
from flask_babel import lazy_gettext
from flask_mail import Mail, Message
from sqlalchemy import create_engine

from flask_appbuilder import const, ModelView, SimpleFormView

from flask_appbuilder.validators import Unique
from flask_appbuilder._compat import as_unicode
from flask_appbuilder.views import expose, PublicFormView, ModelView
from flask_appbuilder.security.decorators import has_access
from flask_appbuilder.security.forms import ResetPasswordForm
from flask_appbuilder.security.views import UserDBModelView, UserStatsChartView
from flask_appbuilder.security.registerviews import RegisterUserDBView, BaseRegisterUser
from flask_appbuilder.urltools import *
from .filters import RoleFilter
from flask_appbuilder.models.sqla.filters import FilterInFunction, FilterContains
from .forms import (
    PasswordRecoverForm, SavvyGroupAddWidget, SavvySiteListWidget, SavvySiteSearchWidget,
    SavvyRegisterInvitationUserDBForm, SavvyRegisterUserDBForm, RegisterInvitationForm,
    CSVToSitesForm

)
from .models import Site
from .filters import get_user_id_list_form_org, get_roles_for_org, get_groups_id_for_org, get_site_id_list_from_org
from .utils import post_request

log = logging.getLogger(__name__)
email_subject = 'SavvyBI - Email Confirmation'


class SavvyUserDBModelView(UserDBModelView):
    base_filters = [['id', RoleFilter, lambda: []]]
    edit_columns = ['first_name', 'last_name', 'active', 'email', 'roles', 'groups']
    edit_form_query_rel_fields = {'roles': [['name', FilterInFunction, get_roles_for_org]],
                                  'groups': [['id', FilterInFunction, get_groups_id_for_org]]}
    show_fieldsets = [
        (lazy_gettext('User info'),
         {'fields': ['username', 'active', 'roles', 'login_count', 'groups']}),
        (lazy_gettext('Personal Info'),
         {'fields': ['first_name', 'last_name', 'email'], 'expanded': True}),
        (lazy_gettext('Audit Info'),
         {'fields': ['last_login', 'fail_login_count', 'created_on',
                     'created_by', 'changed_on', 'changed_by'], 'expanded': False}),
    ]

    def pre_delete(self, user):
        print(user)
        organization = self.appbuilder.sm.find_org(user_id=user.id)
        for role in user.roles:
            if role.name == 'org_owner' and organization and len(organization.users) > 0:
                for user_ in organization.users:
                    if user_ != user:
                        self.delete(user_)

        if organization and len(organization.users) == 1:
            self.delete_athena_key(organization.id)
            self.appbuilder.sm.delete_org(organization)

    def delete_athena_key(self, org_id):
        post_request('https://3ozse3mao8.execute-api.ap-southeast-2.amazonaws.com/test/deleteorg',
                     {"org_id": org_id})

    @expose('/add', methods=['GET', 'POST'])
    @has_access
    def add(self):
        is_admin = False
        for role in g.user.roles:
            if role.name == 'Admin':
                is_admin = True
                break
        if is_admin:
            widget = self._add()
            if not widget:
                return self.post_add_redirect()
            else:
                return self.render_template(self.add_template,
                                            title=self.add_title,
                                            widgets=widget)
        else:
            return redirect('register/invite')


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

            try:
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
            except Exception as e:
                flash(as_unicode(e), 'danger')
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
            self.handle_aws_info(org_reg, user)
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
    def handle_aws_info(self, org, user):
        info = post_request('https://3ozse3mao8.execute-api.ap-southeast-2.amazonaws.com/test/createorg',
                            {"org_name": org.organization_name, "org_id": org.id})
        aws_info = json.loads(info.text)
        access_key = aws_info['AccessKeyId']
        secret_key = aws_info['SecretAccessKey']
        athena_link = f'awsathena+jdbc://{access_key}:{secret_key}@athena.ap-southeast-2.amazonaws.com/meter_loader_new_test_db?s3_staging_dir=s3://a.meter-test.dex/test_query_result'
        print(athena_link)
        self.testconn(athena_link, org, user)

    def testconn(self, athena_link, org, user):
        """Tests a sqla connection"""
        from ..views.base import json_error_response

        times_trail = 3

        for i in range(times_trail):
            while True:
                try:
                    time.sleep(8)
                    self.appbuilder.sm.create_db_role(org.organization_name, athena_link, user)
                except Exception as e:
                    if i == times_trail-1:
                        logging.exception(e)
                        return json_error_response((
                                                       'Connection failed!\n\n'
                                                       'The error message returned was:\n{}').format(e))
                    continue
                break

    def form_post(self, form):
        self.add_form_unique_validations(form)
        self.add_registration_org_admin(organization=form.organization.data,
                                        first_name=form.first_name.data,
                                        last_name=form.last_name.data,
                                        email=form.email.data,
                                        password=form.password.data)

    def add_registration_org_admin(self, **kwargs):
        """
            Add a registration request for the user.

        :rtype : RegisterUser
        """

        register_user = self.appbuilder.sm.add_register_user_org_admin(**kwargs)
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


class SavvyRegisterUserModelView(ModelView):
    route_base = '/registeruser'
    base_permissions = ['can_list', 'can_show', 'can_delete']
    list_title = lazy_gettext('List of Registration Requests')
    show_title = lazy_gettext('Show Registration')
    list_columns = ['registration_date', 'email', 'organization']
    show_exclude_columns = ['password']
    search_exclude_columns = ['password']
    base_filters = [['inviter', FilterInFunction, get_user_id_list_form_org]]


class SavvyUserStatsChartView(UserStatsChartView):
    base_filters = [['id', FilterInFunction, get_user_id_list_form_org]]


class SavvySiteModelView(ModelView):
    route_base = '/sites'

    list_title = lazy_gettext('List Sites')
    show_title = lazy_gettext('Show Site')
    add_title = lazy_gettext('Add Sites to Organisation')
    edit_title = lazy_gettext('Edit Site')

    search_widget = SavvySiteSearchWidget
    page_size = 500

    list_columns = ['SiteID','SiteName', 'AddressLine', 'State', 'city']
    list_widget = SavvySiteListWidget
    label_columns = {'SiteName': lazy_gettext('Site Name'), 'AddressLine': lazy_gettext('Address line')}
    base_permissions = ['can_list', 'can_add']

    add_form = CSVToSitesForm
    add_columns = ['org', 'csv_file']

    base_filters = [['SiteID', FilterInFunction, get_site_id_list_from_org]]


    @expose('/add', methods=['POST','GET'])
    def add(self):
        if request.method == 'GET':

            return super(SavvySiteModelView, self).add()

        from werkzeug.utils import secure_filename
        import os
        from superset import app, db
        from superset.utils import core as utils
        from superset.models.core import Database
        from superset.db_engine_specs import BaseEngineSpec
        from superset.connectors.sqla.models import SqlaTable
        config = app.config
        form = self.add_form.refresh()
        org = form.org.data

        csv_file = form.csv_file.data

        database = db.session.query(
            Database).filter_by(
            id=1).all()

        form.csv_file.data.filename = secure_filename(form.csv_file.data.filename)
        csv_filename = form.csv_file.data.filename
        path = os.path.join(config['UPLOAD_FOLDER'], csv_filename)
        try:
            utils.ensure_path_exists(config['UPLOAD_FOLDER'])
            csv_file.save(path)

            table = SqlaTable(table_name='sites_data')
            table.database = database[0]
            table.database_id = database[0].id

            kwargs = {
                'filepath_or_buffer': form.csv_file.data.filename,
                'header': 0,
                'mangle_dupe_cols': True,
                'skipinitialspace': False,
                'skip_blank_lines': True,
                'parse_dates': False,
                'infer_datetime_format': False,
                'chunksize': 10000,
            }
            df = BaseEngineSpec.csv_to_df(**kwargs)
            existing_site_ids = []
            for s in org.sites:
                existing_site_ids.append(s.SiteID)

            for i in range(df.shape[0]):
                site = Site(df.iloc[i].values.tolist())
                if site.SiteID in existing_site_ids:
                    continue
                org.sites.append(site)
            db.session.merge(org)
            db.session.commit()

        except Exception as e:
            print(e)
            try:
                os.remove(path)
            except OSError:
                pass
            return redirect('/sites/list')

        # Go back to welcome page / splash screen
        # db_name = table.database.database_name
        # message = _('CSV file "{0}" uploaded to table "{1}" in '
        #             'database "{2}"'.format(csv_filename,
        #                                     form.name.data,
        #                                     db_name))
        # flash(message, 'info')
        # stats_logger.incr('successful_csv_upload')
        print('csv done')
        return redirect('/sites/list/')

    @expose('/ajax', methods=['GET'])
    def ajax(self):
        widget = self.appbuilder.sm.get_sites_list_widget()
        return self.render_template('superset/models/group/site_list.html',
                                    widgets=widget)


class SavvyGroupModelView(ModelView):
    route_base = '/groups'

    list_title = lazy_gettext('List Groups')
    show_title = lazy_gettext('Show group')
    add_title = lazy_gettext('Add group')
    edit_title = lazy_gettext('Edit group')

    add_widget = SavvyGroupAddWidget
    add_template = 'superset/models/group/add.html'

    edit_widget = SavvyGroupAddWidget
    edit_template = 'superset/models/group/edit.html'

    add_columns = ['group_name', 'sites']
    edit_columns = add_columns
    label_columns = {'group_name': lazy_gettext('Group Name'), 'sites': lazy_gettext('Sites')}
    list_columns = ['group_name', 'sites']

    order_columns = ['group_name']

    base_filters = [['id', FilterInFunction, get_groups_id_for_org]]

    @expose('/add', methods=['GET', 'POST'])
    @has_access
    def add(self):
        widget1 = self._add()
        if not widget1:
            return self.post_add_redirect()
        else:
            widget2 = self.appbuilder.sm.get_sites_list_widget()
            widgets = {**widget1, **widget2}
            return self.render_template(self.add_template,
                                        title=self.add_title,
                                        widgets=widgets)

    @expose('/edit/<pk>', methods=['GET', 'POST'])
    @has_access
    def edit(self, pk):
        pk = self._deserialize_pk_if_composite(pk)
        widget1, site_list = self._edit(pk)

        if not widget1:
            return self.post_edit_redirect()
        else:
            widget2 = self.appbuilder.sm.get_sites_list_widget()
            widgets = {**widget1, **widget2}
            return self.render_template(self.edit_template,
                                        title=self.edit_title,
                                        widgets=widgets,
                                        site_list=site_list)

    @expose('/ajax', methods=['GET'])
    def ajax(self):
        widget = self.appbuilder.sm.get_sites_list_widget()
        return self.render_template('superset/models/group/site_list.html',
                                    widgets=widget)

    def _add(self):
        is_valid_form = True
        exclude_cols = self._filters.get_relation_cols()
        form = self.add_form.refresh()
        if request.method == 'POST':
            self._fill_form_exclude_cols(exclude_cols, form)
            if form.validate():
                self.process_form(form, True)
                item = self.datamodel.obj()
                try:
                    form.populate_obj(item)
                    sites_list = form.sites.raw_data[0].split(',')
                    sites = self.appbuilder.sm.get_sites_list(sites_list)
                    item.sites = sites
                    user = g.user
                    print(self.appbuilder.sm.find_org(user_id=user.id).organization_name)
                    item.organization_id = self.appbuilder.sm.find_org(user_id=user.id).id
                    self.pre_add(item)
                except Exception as e:
                    print(e)
                else:
                    if self.datamodel.add(item):
                        self.post_add(item)
                    flash(*self.datamodel.message)
                finally:
                    return None
            else:
                is_valid_form = False
        if is_valid_form:
            self.update_redirect()
        return self._get_add_widget(form=form, exclude_cols=exclude_cols)

    def _edit(self, pk):
        """
            Edit function logic, override to implement different logic
            returns Edit widget and related list or None
        """
        is_valid_form = True
        pages = get_page_args()
        page_sizes = get_page_size_args()
        orders = get_order_args()
        get_filter_args(self._filters)
        exclude_cols = self._filters.get_relation_cols()

        item = self.datamodel.get(pk, self._base_filters)
        if not item:
            return None
            # abort(404)
        # convert pk to correct type, if pk is non string type.
        pk = self.datamodel.get_pk_value(item)

        if request.method == 'POST':
            form = self.edit_form.refresh(request.form)
            # fill the form with the suppressed cols, generated from exclude_cols
            self._fill_form_exclude_cols(exclude_cols, form)
            # trick to pass unique validation
            form._id = pk
            if form.validate():
                self.process_form(form, False)
                form.populate_obj(item)

                # Here read raw data of sites field from front end and find list of sites then append
                sites_list = form.sites.raw_data[0].split(',')
                sites = self.appbuilder.sm.get_sites_list(sites_list)
                item.sites = sites
                try:
                    self.pre_update(item)
                except Exception as e:
                    flash(str(e), "danger")
                else:
                    if self.datamodel.edit(item):
                        self.post_update(item)
                    flash(*self.datamodel.message)
                finally:
                    return None, None
            else:
                is_valid_form = False
        else:
            # Only force form refresh for select cascade events
            form = self.edit_form.refresh(obj=item)
            # Perform additional actions to pre-fill the edit form.
            self.prefill_form(form, pk)
        sites_list = [site.SiteID for site in item.sites]
        widgets = self._get_edit_widget(form=form, exclude_cols=exclude_cols)
        widgets = self._get_related_views_widgets(item, filters={},
                                                  orders=orders, pages=pages, page_sizes=page_sizes, widgets=widgets)
        if is_valid_form:
            self.update_redirect()
        return widgets, sites_list

# class CsvToSiteView(SimpleFormView):
#     form = CSVToSitesForm
#     form_template = 'superset/form_view/csv_to_database_view/edit.html'
#     form_title = lazy_gettext('Upload Sites')
#
#     def form_get(self, form):
#         pass
#
#     def form_post(self, form):
#         from werkzeug.utils import secure_filename
#         import os
#         from superset import app, db
#         from superset.utils import core as utils
#         from superset.models.core import Database
#         from superset.db_engine_specs import BaseEngineSpec
#         from superset.connectors.sqla.models import SqlaTable
#         config = app.config
#         org = form.org.data
#
#         csv_file = form.csv_file.data
#
#         database = db.session.query(
#             Database).filter_by(
#             id=1).all()
#
#         form.csv_file.data.filename = secure_filename(form.csv_file.data.filename)
#         csv_filename = form.csv_file.data.filename
#         path = os.path.join(config['UPLOAD_FOLDER'], csv_filename)
#         try:
#             utils.ensure_path_exists(config['UPLOAD_FOLDER'])
#             csv_file.save(path)
#
#             table = SqlaTable(table_name='sites_data')
#             table.database = database
#             table.database_id = database.id
#
#             kwargs = {
#                 'filepath_or_buffer': form.csv_file.data.filename,
#                 'sep': form.sep.data,
#                 'header': form.header.data if form.header.data else 0,
#                 'index_col': form.index_col.data,
#                 'mangle_dupe_cols': form.mangle_dupe_cols.data,
#                 'skipinitialspace': form.skipinitialspace.data,
#                 'skiprows': form.skiprows.data,
#                 'nrows': form.nrows.data,
#                 'skip_blank_lines': form.skip_blank_lines.data,
#                 'parse_dates': form.parse_dates.data,
#                 'infer_datetime_format': form.infer_datetime_format.data,
#                 'chunksize': 10000,
#             }
#             df = BaseEngineSpec.csv_to_df(**kwargs)
#
#             df_to_db_kwargs = {
#                 'table': table,
#                 'df': df,
#                 'name': table.name,
#                 'con': create_engine(database.sqlalchemy_uri, echo=False),
#                 'schema': form.schema.data,
#                 'if_exists': 'append',
#             }
#
#             SiteIDList = df['SiteID']
#             print(SiteIDList)
#             df.to_sql(**df_to_db_kwargs)
#
#
#
#         except Exception as e:
#             try:
#                 os.remove(path)
#             except OSError:
#                 pass
#             message = 'Table name {} already exists. Please pick another'.format(
#                 form.name.data) if isinstance(e, IntegrityError) else e
#             flash(
#                 message,
#                 'danger')
#             stats_logger.incr('failed_csv_upload')
#             return redirect('/csvtodatabaseview/form')
#
#         os.remove(path)
#         # Go back to welcome page / splash screen
#         db_name = table.database.database_name
#         message = _('CSV file "{0}" uploaded to table "{1}" in '
#                     'database "{2}"'.format(csv_filename,
#                                             form.name.data,
#                                             db_name))
#         flash(message, 'info')
#         stats_logger.incr('successful_csv_upload')
#         return redirect('/tablemodelview/list/')
#     #


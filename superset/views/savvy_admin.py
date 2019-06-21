from flask import g, flash, redirect, url_for
from flask_appbuilder import BaseView
from flask_appbuilder.views import expose

from superset import appbuilder, db
from superset.savvy.models import Group, SavvyUser, OrgRegisterUser, Organization
from superset.savvy.decorator import has_access_savvybi_admin

def get_organization_name():
    user = db.session.query(SavvyUser).filter_by(id=g.user.get_id()).first()

    if user.email_confirm is True:
        organization = db.session.query(Organization).filter(Organization.users.any(id=user.id)).scalar()
        org_name = organization.organization_name
    else:
        org_register = db.session.query(OrgRegisterUser).filter_by(email=user.email).first()
        org_name = org_register.organization
    return org_name


class SavvybiAdminView(BaseView):
    route_base = "/admin"

    @expose('/')
    @has_access_savvybi_admin
    def index(self):
        return redirect(url_for('AccountView.about'))


class AccountView(SavvybiAdminView):
    route_base = "/admin/account"

    @expose('/about')
    @has_access_savvybi_admin
    def about(self):
        if not g.user or not g.user.get_id():
            return redirect(appbuilder.get_url_for_login)

        is_orgowner = False
        for role in g.user.roles:
            if role.name == 'org_owner':
                is_orgowner = True
                break
        if is_orgowner is False:
            flash('Access is denied. Only organization owner can access it.', 'info')
            return redirect(appbuilder.get_url_for_index)

        overview_values = {} # required parameters for Overview tab page in Account/About
        admin_owner_list = []  # required parameters for Admins&Owners tab page in Account/About
        bav_values = {}  # required parameters for BAV tab page in Account/About
        role_matches = {'org_owner': 'Owner', 'org_superuser': 'Super User', 'org_user': 'Standard User', 'org_viewer': 'Viewer', 'Admin': 'Admin'}

        user = db.session.query(SavvyUser).filter_by(id=g.user.get_id()).first()
        if user.email_confirm is True:
            organization = db.session.query(Organization).filter(Organization.users.any(id=user.id)).scalar()
            overview_values['organization'] = organization.organization_name
            overview_values['date_created'] = organization.date_created.date()
            overview_values['meter_count'] = len(organization.sites)

            for user in organization.users:
                individual = {}
                individual['fullname'] = "{} {}".format(user.first_name.capitalize(), user.last_name.capitalize())
                individual['email'] = user.email
                individual['role'] = role_matches[user.roles[0].name]
                admin_owner_list.append(individual)
        else:
            org_register = db.session.query(OrgRegisterUser).filter_by(email=user.email).first()
            overview_values['organization'] = org_register.organization
            overview_values['date_created'] = org_register.registration_date.date()
            overview_values['meter_count'] = 0
            admin_owner_list['users'] = []

        username = '{} {}'.format(user.first_name, user.last_name)
        return self.render_template(
            'savvy/account/about.html',
            overview=overview_values,
            admin_owner=admin_owner_list,
            username=username
        )

    @expose('/profile')
    @has_access_savvybi_admin
    def profile(self):

        return self.render_template(
            'savvy/account/profile.html'
        )

    @expose('/plan')
    @has_access_savvybi_admin
    def plan(self):

        return self.render_template(
            'savvy/account/plan.html'
        )

    @expose('/billing')
    @has_access_savvybi_admin
    def billing(self):

        return self.render_template(
            'savvy/account/billing.html'
        )


class AdministrationView(SavvybiAdminView):
    route_base = "/admin/administration"

    @expose('/members')
    @has_access_savvybi_admin
    def members(self):
        user = db.session.query(SavvyUser).filter_by(id=g.user.get_id()).first()
        username = '{} {}'.format(user.first_name, user.last_name)
        return self.render_template(
            'savvy/admin/members.html',
            workspace=get_organization_name().capitalize(),
            username=username
        )

    @expose('/invitation')
    @has_access_savvybi_admin
    def invitation(self):
        organization = db.session.query(Organization).filter(Organization.users.any(id=g.user.get_id())).first()
        groups = db.session.query(Group).filter_by(organization_id=organization.id).all()

        group_list = []
        for group in groups:
            elem = {}
            elem['id'] = group.id
            elem['name'] = group.group_name
            group_list.append(elem)

        return self.render_template(
            'savvy/admin/invitation.html',
            workspace = get_organization_name().capitalize(),
            groups= group_list
        )

    @expose('/data')
    @has_access_savvybi_admin
    def data(self):

        return self.render_template(
            'savvy/admin/data.html'
        )

    @expose('/integration')
    @has_access_savvybi_admin
    def integration(self):

        return self.render_template(
            'savvy/admin/integration.html'
        )


appbuilder.add_view_no_menu(SavvybiAdminView)
appbuilder.add_view_no_menu(AccountView)
appbuilder.add_view_no_menu(AdministrationView)
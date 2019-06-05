from flask import g, flash, redirect, url_for
from flask_appbuilder import BaseView
from flask_appbuilder.views import expose

from superset import appbuilder, db
from superset.savvy.models import Group, Site, SavvyUser, OrgRegisterUser, Organization

class SavvybiAdmin(BaseView):
    route_base = "/admin"

    @expose('/')
    def index(self):
        return redirect(url_for('AccountView.about'))


class AccountView(SavvybiAdmin):
    route_base = "/admin/account"

    @expose('/about')
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

        user = db.session.query(SavvyUser).filter_by(id=g.user.get_id()).first()

        if user.email_confirm is True:
            organization = db.session.query(Organization).filter(Organization.users.any(id=user.id)).scalar()
            org_name = organization.organization_name
        else:
            org_register = db.session.query(OrgRegisterUser).filter_by(email=user.email).first()
            org_name = org_register.organization
        username = '{} {}'.format(user.first_name, user.last_name)
        return self.render_template(
            'savvy/account/about.html',
            organization=org_name.capitalize(),
            username=username
        )

    @expose('/profile')
    def profile(self):

        return self.render_template(
            'savvy/account/profile.html'
        )

    @expose('/plan')
    def plan(self):

        return self.render_template(
            'savvy/account/plan.html'
        )

    @expose('/billing')
    def billing(self):

        return self.render_template(
            'savvy/account/billing.html'
        )


class AdminView(SavvybiAdmin):
    route_base = "/admin/administration"

    @expose('/members')
    def members(self):
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

        user = db.session.query(SavvyUser).filter_by(id=g.user.get_id()).first()

        if user.email_confirm is True:
            organization = db.session.query(Organization).filter(Organization.users.any(id=user.id)).scalar()
            org_name = organization.organization_name
        else:
            org_register = db.session.query(OrgRegisterUser).filter_by(email=user.email).first()
            org_name = org_register.organization
        username = '{} {}'.format(user.first_name, user.last_name)
        return self.render_template(
            'savvy/admin/members.html',
            organization=org_name.capitalize(),
            username=username
        )

    @expose('/invitation')
    def invitation(self):

        return self.render_template(
            'savvy/admin/invitation.html'
        )

    @expose('/data')
    def data(self):

        return self.render_template(
            'savvy/admin/data.html'
        )

    @expose('/integration')
    def integration(self):

        return self.render_template(
            'savvy/admin/integration.html'
        )


appbuilder.add_view_no_menu(SavvybiAdmin)
appbuilder.add_view_no_menu(AccountView)
appbuilder.add_view_no_menu(AdminView)
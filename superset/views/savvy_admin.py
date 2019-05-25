from pyathenajdbc import connect
from flask import render_template, request, g, flash, redirect
from flask_appbuilder import BaseView
from flask_appbuilder.views import expose

from superset import appbuilder, db
from superset.connectors.sqla.models import SqlaTable, TableColumn
from superset.models.core import Database
from superset.views.utils import parse_sqalchemy_uri
from superset.savvy.models import Group, Site, SavvyUser, OrgRegisterUser, Organization


class SavvybiAdmin(BaseView):
    route_base = "/admin"

    @expose('/account/about')
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

    @expose('/account/profile')
    def profile(self):

        return self.render_template(
            'savvy/account/profile.html'
        )

    @expose('/account/plan')
    def plan(self):

        return self.render_template(
            'savvy/account/plan.html'
        )

    @expose('/account/billing')
    def billing(self):

        return self.render_template(
            'savvy/account/billing.html'
        )



appbuilder.add_view_no_menu(SavvybiAdmin)
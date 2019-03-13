from flask_appbuilder.models.filters import BaseFilter
from flask import g

from .models import Organization


class OrgFilter(BaseFilter):
    def apply(self, query, func):
        from superset import security_manager, db

        for role in g.user.roles:
            if role.name == 'Admin':
                return query

        org = Organization
        users_in_org = []

        try:
            users_in_org = db.session.query(org).filter(org.users.any(id=g.user.id)).first().users
        except:
            pass

        user_ids = []
        for user_ in users_in_org:
            user_ids.append(user_.id)
        user = security_manager.user_model
        query = query.filter(user.id.in_(user_ids))

        return query


class RoleFilter(BaseFilter):
    def apply(self, query, func):
        from superset import security_manager, db

        org_owner = 'org_owner'
        org_superuser = 'org_superuser'
        org_user = 'org_user'
        org_viewer = 'org_viewer'

        org_roles = [org_owner,org_superuser, org_user, org_viewer]

        for role in g.user.roles:
            if role.name == 'Admin':
                return query
            if role.name == org_owner:
                break
            if role.name == org_superuser:
                org_roles.remove(org_owner)
                break


        org = Organization
        users_in_org = []
        try:
            users_in_org = db.session.query(org).filter(org.users.any(id=g.user.id)).first().users
        except:
            pass

        user_ids = []
        for user_ in users_in_org:
            for role in user_.roles:
                if role.name in org_roles:
                    user_ids.append(user_.id)
        user = security_manager.user_model
        query = query.filter(user.id.in_(user_ids))

        return query
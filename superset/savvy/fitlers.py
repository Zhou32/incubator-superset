from flask_appbuilder.models.filters import BaseFilter


class OrgFilter(BaseFilter):
    def apply(self, query, func):
        from superset import security_manager, db
        from .models import Organization
        user = security_manager.user_model
        current_user_roles = db.session.query(user).filter(user.id==user.get_user_id()).first().roles

        for role in current_user_roles:
            if role.name == 'Admin':
                return query

        org = Organization
        users_in_org = db.session.query(org).filter(org.users.any(id=user.get_user_id())).first().users
        user_ids = []
        for user_ in users_in_org:
            user_ids.append(user_.id)
        query = query.filter(user.id.in_(user_ids))
        return query


class RoleFilter(BaseFilter):
    def apply(self, query, func):
        from superset import security_manager, db
        from .models import Organization
        from .models import assoc_org_user
        org = Organization
        user = security_manager.user_model
        current_user_roles = db.session.query(id=user.get_user_id()).all().roles

        for role in current_user_roles:
            if role.name == 'admin':
                return query

        users_in_org = db.session.query(org).filter(org.users.any(id=user.get_user_id())).first().users


        org = Organization
        users_in_org = db.session.query(org).filter(org.users.any(id=user.get_user_id())).first().users
        user_ids = []
        for user_ in users_in_org:
            user_ids.append(user_.id)
        query = query.filter(user.id.in_(user_ids))
        return query
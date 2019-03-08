from flask_appbuilder.models.filters import BaseFilter


class OrgFilter(BaseFilter):
    def apply(self, query, func):
        from superset import security_manager, db
        from .models import Organization
        from .models import assoc_org_user
        # if security_manager.all_datasource_access():
        #     return query
        user = security_manager.user_model
        org = Organization
        users_in_org = db.session.query(org).filter(org.users.any(id=user.get_user_id())).first().users
        user_ids = []
        for user_ in users_in_org:
            user_ids.append(user_.id)
        query = query.filter(user.id.in_(user_ids))
        return query

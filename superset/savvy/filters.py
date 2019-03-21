from flask_appbuilder.models.filters import BaseFilter
from flask_appbuilder.models.sqla.filters import get_field_setup_query
from flask import g
from .models import Organization


def get_roles_for_org():
    from superset import security_manager, db
    role_model = security_manager.role_model

    for role in g.user.roles:
        if role.name == 'Admin':
            roles = db.session.query(role_model).all()
            all_role_name = []
            for i in roles:
                all_role_name.append(i.name)
            return all_role_name
    org = Organization
    org_name = ''
    try:
        org_name = db.session.query(org).filter(org.users.any(id=g.user.id)).first().organization_name
    except:
        pass

    org_owner = 'org_owner'
    org_superuser = 'org_superuser'
    org_user = 'org_user'
    org_viewer = 'org_viewer'

    for role in g.user.roles:
        if role.name == org_owner:
            return [org_owner,org_superuser,org_user,org_viewer,f'org_db_{org_name}']
        if role.name == org_superuser:
            return [org_superuser, org_user, org_viewer, f'org_db_{org_name}']

    return []


def get_user_id_list_form_org():
    from superset import security_manager, db
    user_model = security_manager.user_model

    for role in g.user.roles:
        if role.name == 'Admin':
            users = db.session.query(user_model.id).all()
            all_user_id = []
            for i in users:
                all_user_id.append(i[0])
            return all_user_id
    org = Organization
    users_in_org = []

    try:
        users_in_org = db.session.query(org).filter(org.users.any(id=g.user.id)).first().users
    except:
        pass

    user_ids = []
    for user_ in users_in_org:
        user_ids.append(user_.id)

    return user_ids


def get_db_name_list_form_org():
    from superset import security_manager, db
    from superset.models.core import Database

    for role in g.user.roles:
        if role.name == 'Admin':
            database_names = db.session.query(Database.database_name).all()
            all_database_names = []
            for i in database_names:
                all_database_names.append(i[0])
            return all_database_names
    org = Organization

    database_name_in_org = []

    try:
        database_in_org = db.session.query(org.organization_name).filter(org.users.any(id=g.user.id)).first()[0]
        database_name_in_org.append(database_in_org)
    except:
        pass

    users_in_org = []
    try:
        users_in_org = db.session.query(org).filter(org.users.any(id=g.user.id)).first().users
    except:
        pass
    user_ids = []
    for user_ in users_in_org:
        user_ids.append(user_.id)
    try:
        database_in_org = db.session.query(Database.database_name).filter(Database.created_by_fk.in_(user_ids)).all()
        for name in database_in_org:
            database_name_in_org.append(name[0])
    except:
        pass

    return database_name_in_org


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
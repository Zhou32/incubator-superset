import functools
from flask import redirect, flash, g
from superset import appbuilder

def has_access_savvybi_admin(f):
    """
        Use this decorator to enable granular security permissions to your API methods.
        Permissions will be associated to a role, and roles are associated to users.
        By default the permission's name is the methods name.
        this will return a message and HTTP 401 is case of unauthorized access.
    """

    def wraps(self, *args, **kwargs):
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

        return f(self, *args, **kwargs)

    return functools.update_wrapper(wraps, f)
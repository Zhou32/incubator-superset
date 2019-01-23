from flask_appbuilder.security.views import UserDBModelView
from flask_appbuilder import expose, has_access
from flask import g


class SolarUserDBModelView(UserDBModelView):

    @expose('/userinfo/')
    @has_access
    def userinfo(self):
        actions = {}
        actions['resetmypassword'] = self.actions.get('resetmypassword')
        actions['userinfoedit'] = self.actions.get('userinfoedit')

        item = self.datamodel.get(g.user.id, self._base_filters)
        widgets = self._get_show_widget(g.user.id, item, actions=actions, show_fieldsets=self.user_show_fieldsets)
        self.update_redirect()
        is_solar = False

        for role in g.user.roles:
            if role.name == 'Admin':
                is_solar = False
                break
            if role.name == 'solar_default':
                is_solar = True
                break
        return self.render_template(self.show_template,
                                    title=self.user_info_title,
                                    widgets=widgets,
                                    appbuilder=self.appbuilder,
                                    is_solar=is_solar
                                    )
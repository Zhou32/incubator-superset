from flask_appbuilder.security.registerviews import RegisterUserDBView


email_subject = 'SolarBI - Email Confirmation '


class SolarRegisterUserDBView(RegisterUserDBView):
    email_subject = email_subject


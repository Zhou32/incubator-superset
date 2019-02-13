# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# pylint: disable=C,R,W
from flask_appbuilder.security.registerviews import RegisterUserDBView
from flask_appbuilder.security.forms import RegisterUserDBForm
from flask_appbuilder.fieldwidgets import BS3TextFieldWidget
from wtforms import StringField
from wtforms.validators import DataRequired
from flask_babel import lazy_gettext
import boto3
from warrant import Cognito

email_subject = 'SolarBI - Email Confirmation '


class SolarRegisterUserDBForm(RegisterUserDBForm):
    organisation = StringField(lazy_gettext('Organisation'),
                               validators=[DataRequired()],
                               widget=BS3TextFieldWidget())


class SolarRegisterUserDBView(RegisterUserDBView):
    form = SolarRegisterUserDBForm

    # email_subject = email_subject

    client = boto3.client('cognito-identity')

    userPoolId = 'ap-southeast-2_d7WXCaXXt'
    appClientId = '30t9qc8hctk8m9l0g7g4la79gm'
    identityPoolId = 'ap-southeast-2:5fc801fb-772f-473f-af4d-ccf1e26000ae'

    def form_post(self, form):
        self.add_form_unique_validations(form)

        userpool_id, client_id = self.create_and_config_userpool(form.organisation.data)

        self.sign_up_user(userpool_id,
                          client_id,
                          form.username.data,
                          form.password.data,
                          form.email.data,
                          form.last_name.data,
                          form.first_name.data,
                          'admin',
                          form.organisation.data)

    def create_and_config_userpool(self, poolname):
        client = boto3.client('cognito-idp')
        response = client.create_user_pool(
            PoolName=poolname,
            Policies={
                'PasswordPolicy': {
                    'MinimumLength': 6,
                    'RequireUppercase': False,
                    'RequireLowercase': True,
                    'RequireNumbers': True,
                    'RequireSymbols': False
                }
            },
            AutoVerifiedAttributes=[
                'email',
            ],
            AliasAttributes=[
                'email',
            ],
            # SmsVerificationMessage='string',
            # EmailVerificationMessage='string',
            # EmailVerificationSubject='string',
            VerificationMessageTemplate={
                # 'SmsMessage': 'string',
                # 'EmailMessage': 'string',
                # 'EmailSubject': 'string',
                # 'EmailMessageByLink': 'string',
                # 'EmailSubjectByLink': 'string',
                'DefaultEmailOption': 'CONFIRM_WITH_LINK'
            },
            # SmsAuthenticationMessage='string',
            # MfaConfiguration='OFF' | 'ON' | 'OPTIONAL',
            DeviceConfiguration={
                'ChallengeRequiredOnNewDevice': False,
                'DeviceOnlyRememberedOnUserPrompt': False
            },
            # EmailConfiguration={
            #     'SourceArn': 'string',
            #     'ReplyToEmailAddress': 'string'
            # },
            # SmsConfiguration={
            #     'SnsCallerArn': 'string',
            #     'ExternalId': 'string'
            # },
            # UserPoolTags={
            #     'string': 'string'
            # },
            AdminCreateUserConfig={
                'AllowAdminCreateUserOnly': False,
                'UnusedAccountValidityDays': 7,
                # 'InviteMessageTemplate': {
                #     'SMSMessage': 'string',
                #     'EmailMessage': 'string',
                #     'EmailSubject': 'string'
                # }
            },
            Schema=[
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'email',
                    'Required': True,
                    # StringAttributeConstraints: {
                    #   MaxLength: 'STRING_VALUE',
                    #   MinLength: 'STRING_VALUE'
                    # }
                },
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'given_name',
                    'Required': True,
                },
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'family_name',
                    'Required': True,
                },
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'query_date',
                },
                {
                    'AttributeDataType': 'Number',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'query_count',
                    'NumberAttributeConstraints': {
                        'MaxValue': '1000000',
                        'MinValue': '0'
                    },
                },
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'role',
                },
                {
                    'AttributeDataType': 'String',
                    'DeveloperOnlyAttribute': False,
                    'Mutable': True,
                    'Name': 'organisation',
                },
            ],
            # UserPoolAddOns={
            #     'AdvancedSecurityMode': 'OFF' | 'AUDIT' | 'ENFORCED'
            # }
        )
        userpool_id = response['UserPool']['Id']

        response = client.create_user_pool_client(
            UserPoolId=userpool_id,
            ClientName='default',
            GenerateSecret=False,
            RefreshTokenValidity=30,
            # ReadAttributes=[
            #     'string',
            # ],
            # WriteAttributes=[
            #     'string',
            # ],
            # ExplicitAuthFlows=[
            #     'ADMIN_NO_SRP_AUTH' | 'CUSTOM_AUTH_FLOW_ONLY' | 'USER_PASSWORD_AUTH',
            # ],
            # SupportedIdentityProviders=[
            #     'string',
            # ],
            # CallbackURLs=[
            #     'string',
            # ],
            # LogoutURLs=[
            #     'string',
            # ],
            # DefaultRedirectURI='string',
            # AllowedOAuthFlows=[
            #     'code' | 'implicit' | 'client_credentials',
            # ],
            # AllowedOAuthScopes=[
            #     'string',
            # ],
            # AllowedOAuthFlowsUserPoolClient=True | False,
            # AnalyticsConfiguration={
            #     'ApplicationId': 'string',
            #     'RoleArn': 'string',
            #     'ExternalId': 'string',
            #     'UserDataShared': True | False
            # }
        )
        client_id = response['UserPoolClient']['ClientId']

        domain_created = False
        suffix = ''
        while not domain_created:
            try:
                response = client.create_user_pool_domain(
                    Domain=str(poolname + suffix).lower().replace(' ', '-'),
                    UserPoolId=userpool_id,
                    # CustomDomainConfig={
                    #     'CertificateArn': 'string'
                    # }
                )
                domain_created = True
            except:
                suffix = '123'

        return userpool_id, client_id

    def update_user_attribute(self, attr_name, attr_value, access_token):
        response = self.client.update_user_attributes(
            UserAttributes=[
                {
                    'Name': attr_name,
                    'Value': attr_value
                },
            ],
            AccessToken=access_token
        )

    def get_user_attributes(self, access_token):
        response = self.client.get_user(
            AccessToken=access_token
        )
        return response['UserAttributes']

    def get_user_query_count(self, attributes):
        result = 999
        for attribute in attributes:
            if attribute['Name'] == 'custom:count':
                result = attribute['Value']
        return result

    def add_user_query_count(self, access_token):
        self.update_user_attribute('custom:count', '11', access_token)

    def sign_up_user(self, userpool_id, client_id, username, password, email,
                     family_name, given_name, role, organisation):
        import datetime
        newUser = Cognito(userpool_id, client_id)
        newUser.add_base_attributes(email=email, family_name=family_name,
                                    given_name=given_name)
        newUser.add_custom_attributes(query_date=str(datetime.date.today()),
                                      query_count='0', role=role,
                                      organisation=organisation)
        newUser.register(username, password)



    # username = 'Colin'
    # password = 'pa55word'
    # email = 'chenyang.wang@zawee.work'
    # family_name = 'Wang'
    # given_name = 'Chenyang'
    # role = 'admin'
    # organisation = 'Colin23'
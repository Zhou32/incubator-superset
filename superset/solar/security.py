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
from ..security import SupersetSecurityManager
from werkzeug.security import check_password_hash
from warrant import Cognito
from .cognito.models import SolarUser
import boto3


class SolarBISecurityManager(SupersetSecurityManager):
    client = boto3.client('cognito-idp')
    userpool_id = 'ap-southeast-2_nc2dPj0ea'
    client_id = '2lkjl3rha09eode9i18icuqi6k'

    def auth_user_db(self, username, password):
        """
            Method for authenticating user, auth db style

            :param username:
                The username or registered email address
            :param password:
                The password, will be tested against hashed password on db
        """
        if username is None or username == "":
            return None
        # user = self.find_user(username=username)
        id_token, access_token, refresh_token = self.login_user('Hill', 'pa55word',
                                                             self.userpool_id,
                                                             self.client_id)
        user_dict = self.user_get_user(access_token)
        user = SolarUser(id=user_dict['query_count'], username=user_dict['Username'],
                         email=user_dict['email'], first_name=user_dict['given_name'],
                         last_name=user_dict['family_name'], active=True)
        return user
        # if user is None:
        #     user = self.find_user(email=username)
        # if user is None or (not user.is_active):
        #     # log.info(LOGMSG_WAR_SEC_LOGIN_FAILED.format(username))
        #     return None
        # elif check_password_hash(user.password, password):
        #     self.update_user_auth_stat(user, True)
        #     return user
        # else:
        #     self.update_user_auth_stat(user, False)
        #     # log.info(LOGMSG_WAR_SEC_LOGIN_FAILED.format(username))
        #     return None

    def login_user(self, username, password, userpool_id, client_id):
        user = Cognito(userpool_id, client_id,
                       username=username)
        user.authenticate(password=password)
        return user.id_token, user.access_token, user.refresh_token

    def user_get_user(self, access_token):
        response = self.client.get_user(
            AccessToken=access_token
        )
        return self.parse_one_user(response)

    def parse_one_user(self, user):
        dict = {}
        for user_info in ['Username', 'Enabled', 'UserStatus']:
            if user_info in user.keys():
                dict[user_info] = user[user_info]
        for attribute in user['UserAttributes']:
            dict[attribute['Name'].split(':')[-1]] = attribute['Value']
        return dict

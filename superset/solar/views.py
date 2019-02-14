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
from flask_appbuilder.security.views import UserDBModelView
from flask_babel import lazy_gettext
import boto3


class SolarUserDBModelView(UserDBModelView):
    client = boto3.client('cognito-idp')

    label_columns = {'get_full_name': lazy_gettext('Full Name'),
                     'given_name': lazy_gettext('First Name'),
                     'family_name': lazy_gettext('Last Name'),
                     'Username': lazy_gettext('User Name'),
                     'organisation': lazy_gettext("Organisation"),
                     'password': lazy_gettext('Password'),
                     'active': lazy_gettext('Is Active?'),
                     'email': lazy_gettext('Email'),
                     'roles': lazy_gettext('Role'),
                     'last_login': lazy_gettext('Last login'),
                     'login_count': lazy_gettext('Login count'),
                     'fail_login_count': lazy_gettext('Failed login count'),
                     'created_on': lazy_gettext('Created on'),
                     'created_by': lazy_gettext('Created by'),
                     'changed_on': lazy_gettext('Changed on'),
                     'changed_by': lazy_gettext('Changed by')}

    list_columns = ['given_name', 'family_name', 'Username', 'email', 'organisation']

    def _get_list_widget(self, filters,
                         actions=None,
                         order_column='',
                         order_direction='',
                         page=None,
                         page_size=None,
                         widgets=None,
                         **args):
        """ get joined base filter and current active filter for query """
        widgets = widgets or {}
        actions = actions or self.actions
        page_size = page_size or self.page_size
        # if not order_column and self.base_order:
        #     order_column, order_direction = self.base_order
        # joined_filters = filters.get_joined_filters(self._base_filters)

        userpool_id = 'ap-southeast-2_nc2dPj0ea'
        count = len(self.list_all_users(userpool_id))
        pks = [1]

        # count, lst = self.datamodel.query(joined_filters, order_column,
        #                                   order_direction, page=page,
        #                                   page_size=page_size)
        # pks = self.datamodel.get_keys(lst)

        # serialize composite pks
        pks = [self._serialize_pk_if_composite(pk) for pk in pks]

        widgets['list'] = self.list_widget(label_columns=self.label_columns,
                                           include_columns=self.list_columns,
                                           value_columns=self.list_all_users(userpool_id),
                                           order_columns=self.order_columns,
                                           formatters_columns=self.formatters_columns,
                                           page=page,
                                           page_size=page_size,
                                           count=count,
                                           pks=pks,
                                           actions=actions,
                                           filters=filters,
                                           modelview_name=self.__class__.__name__)
        return widgets

    def parse_users(self, users):
        user_list = []
        for user in users:
            dict = {}
            dict['Username'] = user['Username']
            for attribute in user['Attributes']:
                dict[attribute['Name'].split(':')[-1]] = attribute['Value']
            user_list.append(dict)
        return user_list

    def list_all_users(self, userpool_id):
        isLastPage = False
        response = self.client.list_users(
            UserPoolId=userpool_id,
            AttributesToGet=['email', 'family_name', 'given_name',
                             'custom:query_date', 'custom:query_count',
                             'custom:role', 'custom:organisation'],
            # Limit=1,
        )
        user_list = self.parse_users(response['Users'])

        if 'PaginationToken' in response.keys():
            pagination_token = response['PaginationToken']
        else:
            isLastPage = True

        while not isLastPage:
            response = self.client.list_users(
                UserPoolId=userpool_id,
                AttributesToGet=['email', 'family_name', 'given_name',
                                 'custom:query_date', 'custom:query_count',
                                 'custom:role', 'custom:organisation'],
                # Limit=1,
                PaginationToken=pagination_token,
            )
            user_list += self.parse_users(response['Users'])
            if 'PaginationToken' in response.keys():
                pagination_token = response['PaginationToken']
            else:
                isLastPage = True

        return user_list



    # print(list_all_users(userpool_id))

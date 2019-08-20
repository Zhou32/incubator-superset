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
from flask_babel import lazy_gettext
from wtforms.validators import DataRequired
from wtforms import (
    BooleanField, SelectField, StringField, PasswordField)
from wtforms.fields.html5 import EmailField

from flask_appbuilder.security.forms import DynamicForm
from flask_appbuilder.widgets import FormWidget


class SolarBILoginForm_db(DynamicForm):
    username = StringField(lazy_gettext("User Name"), validators=[DataRequired()])
    password = PasswordField(lazy_gettext("Password"), validators=[DataRequired()])
    remember_me = BooleanField(lazy_gettext('remember me'), default=False)


class SavvyRegisterFormWidget(FormWidget):
    template = 'appbuilder/general/security/register_form.html'

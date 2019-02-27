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
"""A collection of ORM sqlalchemy models for Superset"""

from datetime import datetime

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean, Column, create_engine, DateTime, ForeignKey, Integer,
    MetaData, String, Table, Text, Sequence
)


from superset import app

config = app.config
custom_password_store = config.get('SQLALCHEMY_CUSTOM_PASSWORD_STORE')
stats_logger = config.get('STATS_LOGGER')
log_query = config.get('QUERY_LOGGER')
metadata = Model.metadata  # pylint: disable=no-member
register_valid_hours = 24


class Organization(Model):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True)
    organization_name = Column(String(250))


class OtherRegisterUser(Model):
    """ the register model for users who are invited by admin """

    __tablename__ = 'other_register_user'
    id = Column(Integer, Sequence('ab_other_register_user_id_seq'), primary_key=True)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=False)
    username = Column(String(64), unique=True, nullable=False)
    password = Column(String(256))
    email = Column(String(64), nullable=False)
    registration_date = Column(DateTime, default=datetime.datetime.now, nullable=True)
    registration_hash = Column(String(256))
    inviter = Column('inviter_id',Integer, ForeignKey('ab_user.id'))
    valid_date = Column(DateTime, default=datetime.datetime.now + datetime.timedelta(hours=register_valid_hours), nullable=True)
    role_assigned = Column('role_id',Integer, ForeignKey('ab_role.id'))


org_user = Table(
    'org_user', metadata,
                   Column('id', Integer, primary_key=True),
                   Column('user_id', Integer, ForeignKey('ab_user.id')),
                   Column('org_id', Integer, ForeignKey('organizations.id')))

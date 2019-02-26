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
import datetime

from flask_appbuilder import Model
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Sequence,\
    Integer, String, Table, UniqueConstraint


class ResetRequest(Model):
    ___tablename__ = 'ab_reset_request'
    id = Column(Integer, Sequence('ab_reset_request_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    email = Column(String(64), nullable=False)
    reset_date = Column(DateTime, default=datetime.datetime.now, nullable=True)
    reset_hash = Column(String(256))
    used = Column(Boolean)


class Organization(Model):
    __tablename__ = 'ab_organization'
    id = Column(Integer, Sequence('ab_org_id_seq'), primary_key=True)
    org_name = Column(String(64), nullable=False)


assoc_org_user = Table('org_user', Model.metadata,
                       Column('id', Integer, Sequence('ab_org_user_id_seq'),
                              primary_key=True),
                       Column('org_id', Integer, ForeignKey('ab_organization.id')),
                       Column('user_id', Integer, ForeignKey('ab_user.id')),
                       UniqueConstraint('org_id', 'user_id'))

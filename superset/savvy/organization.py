"""A collection of ORM sqlalchemy models for Superset"""

from datetime import timedelta, datetime

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean, Column, create_engine, DateTime, ForeignKey, Integer,
    MetaData, String, Table, Text, Sequence, UniqueConstraint
)
from sqlalchemy.orm import relationship, backref
from flask_appbuilder.security.sqla.models import RegisterUser

# from superset import app
#
# config = app.config
# custom_password_store = config.get('SQLALCHEMY_CUSTOM_PASSWORD_STORE')
# stats_logger = config.get('STATS_LOGGER')
# log_query = config.get('QUERY_LOGGER')
metadata = Model.metadata  # pylint: disable=no-member
register_valid_hours = 24

assoc_org_user = Table(
    'org_user', metadata,
    Column('id', Integer, primary_key=True),
    Column('user_id', Integer, ForeignKey('ab_user.id')),
    Column('org_id', Integer, ForeignKey('organizations.id')),
    UniqueConstraint('user_id', 'org_id')
)


class Organization(Model):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True)
    organization_name = Column(String(250))
    users = relationship('User', secondary=assoc_org_user, backref='organization')


class OrgRegisterUser(Model):
    """ the register model for users who are invited by admin """
    __tablename__ = 'ab_register_user_all'
    id = Column(Integer, Sequence('ab_register_user_all_id_seq'), primary_key=True)
    first_name = Column(String(64), nullable=False)
    last_name = Column(String(64), nullable=False)
    password = Column(String(256))
    email = Column(String(64), nullable=False)
    registration_date = Column(DateTime, default=datetime.now, nullable=True)
    registration_hash = Column(String(256))
    organization = Column(String(250), nullable=False)
    inviter = Column('inviter_id', Integer, ForeignKey('ab_user.id'),nullable=True)
    valid_date = Column(DateTime, default=(datetime.now() + timedelta(hours=register_valid_hours)), nullable=True)
    role_assigned = Column('role_id', Integer, ForeignKey('ab_role.id'), nullable=True)

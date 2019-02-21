import datetime
from sqlalchemy import Table, Column, Integer, String, Boolean, DateTime, ForeignKey, Sequence, UniqueConstraint
from sqlalchemy.orm import relationship, backref
from sqlalchemy.ext.declarative import declared_attr
from flask_appbuilder._compat import as_unicode
from flask_appbuilder import Model


class ResetRequest(Model):
    ___tablename__ = 'ab_reset_request'
    id = Column(Integer, Sequence('ab_reset_request_id_seq'), primary_key=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    email = Column(String(64), nullable=False)
    reset_date = Column(DateTime, default=datetime.datetime.now, nullable=True)
    reset_hash = Column(String(256))
    used = Column(Boolean)

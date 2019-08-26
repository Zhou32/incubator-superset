import datetime

from flask_appbuilder import Model
from sqlalchemy import (
    Boolean, Column, DateTime, Integer, Float, String, UniqueConstraint, ForeignKey, Sequence, Table)


class ResetRequest(Model):
    ___tablename__ = 'reset_request'
    id = Column(Integer, Sequence('reset_request_id_seq'), primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('ab_user.id'))
    email = Column(String(64), nullable=False)
    reset_date = Column(DateTime, default=datetime.datetime.now, nullable=True)
    reset_hash = Column(String(256))
    used = Column(Boolean)

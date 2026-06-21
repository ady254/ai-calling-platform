from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base


class User(Base):

    __tablename__ = "users"

    # Fix #28: Use server_default for UUID, add nullable=False and length limits,
    # add index=True on email for fast login lookups.
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
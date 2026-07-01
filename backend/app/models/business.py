from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base


class Business(Base):

    __tablename__ = "businesses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # unique=True: one business per user. Without this, a duplicate POST to
    # /business/ silently created a second row and every subsequent
    # get_user_business() lookup (which assumes exactly 0 or 1 result) would
    # raise an unhandled MultipleResultsFound -> 500 for that user forever.
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    name = Column(String)
    industry = Column(String)
    default_language = Column(String)
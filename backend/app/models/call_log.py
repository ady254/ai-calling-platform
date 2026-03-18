from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base


class CallLog(Base):

    __tablename__ = "call_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))

    status = Column(String)   # started, completed, failed
    transcript = Column(String)

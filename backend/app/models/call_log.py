from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

from app.db.base import Base


class CallLog(Base):

    __tablename__ = "call_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"))

    status = Column(String)   # started, completed, failed
    transcript = Column(String, nullable=True)
    duration = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    
    contact = relationship("Contact", backref="call_logs")

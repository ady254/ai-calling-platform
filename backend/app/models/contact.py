from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone

from app.db.base import Base


class ContactStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    NO_ANSWER = "no_answer"
    CALLBACK = "callback"
    CONVERTED = "converted"
    DO_NOT_CALL = "do_not_call"


class Contact(Base):

    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)

    name = Column(String(255), nullable=False)
    phone_number = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    notes = Column(Text, nullable=True)

    status = Column(
        SAEnum(ContactStatus, values_callable=lambda e: [x.value for x in e]),
        default=ContactStatus.NEW,
        nullable=False,
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    campaigns = relationship("CampaignContact", back_populates="contact", cascade="all, delete-orphan")
    business = relationship("Business", backref="contacts")
from sqlalchemy import Column, String, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone

from app.db.base import Base


class CampaignContactStatus(str, enum.Enum):
    PENDING = "pending"
    CALLING = "calling"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class CampaignContact(Base):
    """Association table linking campaigns to contacts with call status."""

    __tablename__ = "campaign_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)

    call_status = Column(
        SAEnum(CampaignContactStatus, values_callable=lambda e: [x.value for x in e]),
        default=CampaignContactStatus.PENDING,
        nullable=False,
    )
    called_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    campaign = relationship("Campaign", back_populates="contacts")
    contact = relationship("Contact", back_populates="campaigns")

from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from datetime import datetime, timezone

from app.db.base import Base


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Campaign(Base):

    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=False)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    objective = Column(String(255), nullable=True)
    language = Column(String(50), default="en")

    status = Column(
        SAEnum(CampaignStatus, values_callable=lambda e: [x.value for x in e]),
        default=CampaignStatus.DRAFT,
        nullable=False,
    )

    # AI agent configuration
    ai_prompt = Column(Text, nullable=True)
    ai_voice = Column(String(100), default="alloy")
    max_retries = Column(Integer, default=2)

    # Scheduling
    scheduled_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    contacts = relationship("CampaignContact", back_populates="campaign", cascade="all, delete-orphan")
    business = relationship("Business", backref="campaigns")
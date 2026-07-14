from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
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

    # Per-contact variables used to personalize campaign scripts, e.g.
    # {"doctor_name": "Dr. Khalid", "appointment_date": "2026-07-05",
    #  "department": "Cardiology", "preferred_language": "ar-AE"}.
    # Rendered into Campaign.ai_prompt via {{variable}} placeholders — see
    # app/utils/templating.py and the /agent/internal/campaign endpoint.
    custom_fields = Column(JSONB, nullable=False, server_default="{}")

    status = Column(
        SAEnum(ContactStatus, values_callable=lambda e: [x.value for x in e]),
        default=ContactStatus.NEW,
        nullable=False,
    )

    # ── CRM fields ────────────────────────────────────────────────────
    # Kept as first-class columns because the CRM table filters/sorts on
    # them. `pipeline_stage` is the sales funnel axis (new → won/lost),
    # separate from `status` (per-call disposition used by the executor).
    industry = Column(String(120), nullable=True)
    lead_score = Column(Integer, nullable=True, index=True)  # 0-100 (AI + rules)
    pipeline_stage = Column(String(20), nullable=False, server_default="new", index=True)

    # Display-only AI output — evolves without a migration. Shape:
    # {"sentiment": "Positive", "conversion_probability": 82,
    #  "buying_intent": "High", "score_reason": "...",
    #  "recommendations": [...], "assigned_agent": "...", "next_follow_up": "..."}
    ai_insights = Column(JSONB, nullable=False, server_default="{}")

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
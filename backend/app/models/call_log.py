from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone

from app.db.base import Base


class CallLog(Base):

    __tablename__ = "call_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), nullable=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"), nullable=True)

    status = Column(String)   # started, completed, failed
    transcript = Column(String, nullable=True)
    duration = Column(Integer, default=0)

    # Twilio recording media URL for this call (the base URL Twilio POSTs to the
    # recording-status callback, e.g. .../Recordings/RE...). Null until Twilio
    # finishes recording and fires the callback. The audio is served to the
    # frontend via an authenticated backend proxy (never exposed directly), since
    # the Twilio media URL requires account credentials to fetch.
    recording_url = Column(String, nullable=True)

    # Post-call outcome extracted from the transcript by the LLM after the
    # call ends: confirmed, rescheduled, callback_requested, not_interested,
    # do_not_call, wrong_person, incomplete, other. Null until extraction
    # runs (or when there is no transcript to analyze).
    outcome = Column(String(32), nullable=True)
    summary = Column(String, nullable=True)
    follow_up = Column(String, nullable=True)

    # Twilio's CallSid — lets the async status-callback webhook find and
    # update the right row once the call actually finishes.
    call_sid = Column(String(64), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    contact = relationship("Contact", backref="call_logs")
    campaign = relationship("Campaign", backref="call_logs")
    business = relationship("Business", backref="call_logs")

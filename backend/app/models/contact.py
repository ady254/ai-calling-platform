from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base


class Contact(Base):

    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"))

    name = Column(String)
    phone_number = Column(String)
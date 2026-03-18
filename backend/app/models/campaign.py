from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.base import Base


class Campaign(Base):

    __tablename__ = "campaigns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    business_id = Column(UUID(as_uuid=True), ForeignKey("businesses.id"))

    name = Column(String)
    objective = Column(String)
    language = Column(String)
from pydantic import BaseModel
from uuid import UUID


class ContactCreate(BaseModel):
    campaign_id: UUID
    name: str
    phone_number: str
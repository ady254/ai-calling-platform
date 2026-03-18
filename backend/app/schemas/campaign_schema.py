from pydantic import BaseModel
from uuid import UUID


class CampaignCreate(BaseModel):
    business_id: UUID
    name: str
    objective: str
    language: str
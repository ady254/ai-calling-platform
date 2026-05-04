from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class CampaignCreate(BaseModel):
    business_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    objective: Optional[str] = None
    language: str = "en"
    ai_prompt: Optional[str] = None
    ai_voice: str = "alloy"
    max_retries: int = 2
    scheduled_at: Optional[datetime] = None
    contact_ids: Optional[list[UUID]] = None  # Attach contacts on creation


class CampaignUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    objective: Optional[str] = None
    language: Optional[str] = None
    status: Optional[str] = None
    ai_prompt: Optional[str] = None
    ai_voice: Optional[str] = None
    max_retries: Optional[int] = None
    scheduled_at: Optional[datetime] = None


class CampaignContactAdd(BaseModel):
    contact_ids: list[UUID]


class CampaignOut(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    description: Optional[str] = None
    objective: Optional[str] = None
    language: str
    status: str
    ai_prompt: Optional[str] = None
    ai_voice: str
    max_retries: int
    scheduled_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    contact_count: int = 0

    class Config:
        from_attributes = True


class CampaignContactOut(BaseModel):
    id: UUID
    contact_id: UUID
    contact_name: str
    contact_phone: str
    contact_email: Optional[str] = None
    call_status: str
    called_at: Optional[datetime] = None

    class Config:
        from_attributes = True
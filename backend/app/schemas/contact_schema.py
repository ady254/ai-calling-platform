from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class ContactCreate(BaseModel):
    business_id: Optional[UUID] = None
    name: str = Field(..., min_length=1, max_length=255)
    phone_number: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    # Free-form per-contact variables (e.g. doctor_name, appointment_date,
    # department, preferred_language) used to personalize campaign scripts.
    custom_fields: Optional[dict] = None


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    custom_fields: Optional[dict] = None


class ContactOut(BaseModel):
    id: UUID
    business_id: UUID
    name: str
    phone_number: str
    email: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    status: str
    custom_fields: dict = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
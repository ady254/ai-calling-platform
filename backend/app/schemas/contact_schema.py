from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime


class ContactCreate(BaseModel):
    business_id: UUID
    name: str = Field(..., min_length=1, max_length=255)
    phone_number: str = Field(..., min_length=1, max_length=50)
    email: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[str] = None
    company: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


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
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
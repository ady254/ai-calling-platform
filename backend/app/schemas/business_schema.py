from uuid import UUID
from typing import Optional

from pydantic import BaseModel


class BusinessCreate(BaseModel):
    name: str
    industry: str
    default_language: str


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    default_language: Optional[str] = None


class BusinessOut(BaseModel):
    id: UUID
    name: Optional[str] = None
    industry: Optional[str] = None
    default_language: Optional[str] = None

    class Config:
        from_attributes = True
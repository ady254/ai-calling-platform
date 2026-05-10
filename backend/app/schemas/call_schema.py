from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class CallLogCreate(BaseModel):
    contact_id: UUID
    status: str
    transcript: Optional[str] = None
    duration: Optional[int] = 0

class CallLogOut(BaseModel):
    id: UUID
    contact_id: Optional[UUID] = None
    campaign_id: Optional[UUID] = None
    business_id: Optional[UUID] = None
    status: str
    transcript: Optional[str] = None
    created_at: Optional[datetime] = None
    duration: Optional[int] = 0

    class Config:
        from_attributes = True

from typing import List, Dict, Any

class AnalyticsOut(BaseModel):
    total_calls: int
    completed_calls: int
    failed_calls: int
    average_duration_seconds: float
    active_campaigns: int = 0
    total_contacts: int = 0
    call_trends: List[Dict[str, Any]] = []

"""
Import every model module here so SQLAlchemy's declarative class registry
is fully populated as soon as anything imports `app.models` (or any
submodule, since Python runs this __init__ first).

Without this, whichever process happens to import only a subset of models
transitively (e.g. the standalone ARQ worker, which only pulls in Campaign/
Contact/CampaignContact/CallLog via campaign_executor.py) will crash the
first time SQLAlchemy tries to resolve a string-based relationship() to a
model that was never imported — e.g. Campaign.business = relationship
("Business", ...) fails with "expression 'Business' failed to locate a
name" if app.models.business was never loaded in that process.
"""
from app.models.user import User
from app.models.business import Business
from app.models.agent import Agent
from app.models.campaign import Campaign, CampaignStatus
from app.models.contact import Contact, ContactStatus
from app.models.campaign_contact import CampaignContact, CampaignContactStatus
from app.models.call_log import CallLog

__all__ = [
    "User",
    "Business",
    "Agent",
    "Campaign",
    "CampaignStatus",
    "Contact",
    "ContactStatus",
    "CampaignContact",
    "CampaignContactStatus",
    "CallLog",
]

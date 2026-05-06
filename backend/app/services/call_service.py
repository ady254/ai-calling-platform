from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.models.contact import Contact
from app.services.twilio_service import make_outbound_call
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

async def start_call(db: AsyncSession, contact_id: str):
    """
    Initiate an outbound call via Twilio to the contact.
    """
    stmt = select(Contact).filter(Contact.id == UUID(contact_id))
    result = await db.execute(stmt)
    contact = result.scalar_one_or_none()

    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    if not contact.phone_number:
        raise HTTPException(status_code=400, detail="Contact does not have a phone number")

    logger.info(f"Starting Twilio outbound call to {contact.phone_number}")
    
    call_result = make_outbound_call(contact.phone_number)
    
    return {
        "status": "initiated",
        "contact_id": contact_id,
        "phone_number": contact.phone_number,
        "twilio_response": call_result
    }
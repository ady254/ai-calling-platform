"""
Twilio voice service.

Handles outbound call creation with campaign context and status callback support.
"""
import logging
import urllib.parse

from twilio.rest import Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Public URL for Twilio webhooks — set this in .env (e.g., BASE_URL=https://xyz.ngrok-free.app)
WEBHOOK_BASE_URL = settings.BASE_URL


def make_outbound_call(
    to_number: str,
    campaign_id: str | None = None,
    contact_id: str | None = None,
) -> dict:
    """
    Make an outbound call using Twilio.
    Falls back to simulation if credentials are not configured.

    NOTE: This function is synchronous (Twilio SDK uses `requests` internally).
    Always call it via `asyncio.to_thread(make_outbound_call, ...)` from async code
    to avoid blocking the event loop.

    Free trial notes:
      - You can only call numbers verified in your Twilio Console.
      - Go to Console → Verified Caller IDs → add the number you want to call.
      - Trial gives ~$15.50 in credits (~50+ test calls).
    """
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials not found. Simulating outbound call.")
        return {
            "status": "simulated",
            "to": to_number,
            "campaign_id": campaign_id,
            "note": (
                "Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and "
                "TWILIO_PHONE_NUMBER in .env to make real calls"
            ),
        }

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Fix #14: URL-encode query parameters to handle any special characters
        # in campaign_id / contact_id (e.g. UUIDs are safe, but defensive coding).
        twiml_url = f"{WEBHOOK_BASE_URL}/call/twilio/twiml"
        if campaign_id:
            params: dict[str, str] = {"campaign_id": campaign_id}
            if contact_id:
                params["contact_id"] = contact_id
            twiml_url = f"{twiml_url}?{urllib.parse.urlencode(params)}"

        status_callback_url = f"{WEBHOOK_BASE_URL}/call/twilio/status-callback"

        call = client.calls.create(
            to=to_number,
            from_=settings.TWILIO_PHONE_NUMBER,
            url=twiml_url,
            status_callback=status_callback_url,
            status_callback_event=["initiated", "ringing", "answered", "completed"],
            status_callback_method="POST",
        )
        logger.info(f"Initiated Twilio call to {to_number}, SID: {call.sid}")
        return {
            "status": "initiated",
            "sid": call.sid,
            "to": to_number,
            "campaign_id": campaign_id,
        }

    except Exception as e:
        logger.error(f"Failed to initiate Twilio call: {e}")
        return {"status": "failed", "error": str(e)}

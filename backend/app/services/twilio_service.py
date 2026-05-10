"""
Twilio voice service.

Handles outbound call creation with campaign context and status callback support.
"""
import logging
from twilio.rest import Client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Public URL for Twilio webhooks — set this when deploying
# For local development, use ngrok: ngrok http 8000
WEBHOOK_BASE_URL = settings.ALLOWED_ORIGINS.split(",")[0].replace("3000", "8000")


def make_outbound_call(
    to_number: str,
    campaign_id: str | None = None,
    contact_id: str | None = None,
):
    """
    Make an outbound call using Twilio.
    Falls back to simulation if credentials are not configured.

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
            "note": "Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env to make real calls"
        }

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

        # Build TwiML URL with campaign context as query params
        twiml_url = f"{WEBHOOK_BASE_URL}/call/twilio/twiml"
        if campaign_id:
            twiml_url += f"?campaign_id={campaign_id}"
            if contact_id:
                twiml_url += f"&contact_id={contact_id}"

        # Status callback URL to track call lifecycle
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

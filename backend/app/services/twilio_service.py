import os
import logging
from twilio.rest import Client

logger = logging.getLogger(__name__)

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

def make_outbound_call(to_number: str):
    """
    Make an outbound call using Twilio.
    For this demo, we point to a standard TwiML or LiveKit SIP trunk.
    """
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials not found. Simulating outbound call.")
        return {"status": "simulated", "to": to_number, "note": "Configure TWILIO_ACCOUNT_SID in .env to make real calls"}

    try:
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # In a real setup, this URL points to LiveKit SIP dispatch or your own backend TwiML
        twiml_url = os.getenv("TWIML_URL", "http://demo.twilio.com/docs/voice.xml")

        call = client.calls.create(
            to=to_number,
            from_=TWILIO_PHONE_NUMBER,
            url=twiml_url
        )
        logger.info(f"Initiated Twilio call to {to_number}, SID: {call.sid}")
        return {"status": "initiated", "sid": call.sid, "to": to_number}
    except Exception as e:
        logger.error(f"Failed to initiate Twilio call: {e}")
        return {"status": "failed", "error": str(e)}

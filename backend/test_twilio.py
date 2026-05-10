"""
Quick Twilio test — makes a real phone call to your verified number.
The call will play a short Twilio demo message and hang up.
"""
from dotenv import load_dotenv
import os

load_dotenv()

SID = os.getenv("TWILIO_ACCOUNT_SID")
TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
FROM = os.getenv("TWILIO_PHONE_NUMBER")

print("=== Twilio Config Check ===")
print(f"  Account SID:  {SID[:8]}...{SID[-4:]}" if SID else "  Account SID:  ❌ MISSING")
print(f"  Auth Token:   {TOKEN[:4]}...{TOKEN[-4:]}" if TOKEN else "  Auth Token:   ❌ MISSING")
print(f"  Phone Number: {FROM}" if FROM else "  Phone Number: ❌ MISSING")

if not all([SID, TOKEN, FROM]):
    print("\n❌ Fix your backend/.env first — some values are missing.")
    exit(1)

# === CHANGE THIS to your verified phone number ===
TO_NUMBER = input("\nEnter YOUR phone number to call (e.g. +918873355385): ").strip()

if not TO_NUMBER.startswith("+"):
    print("❌ Number must start with + (E.164 format). Example: +918873355385")
    exit(1)

print(f"\n📞 Calling {TO_NUMBER} from {FROM}...")

from twilio.rest import Client

try:
    client = Client(SID, TOKEN)
    call = client.calls.create(
        to=TO_NUMBER,
        from_=FROM,
        url="http://demo.twilio.com/docs/voice.xml"  # Plays a short demo message
    )
    print(f"✅ Call initiated! SID: {call.sid}")
    print(f"   Status: {call.status}")
    print(f"\n🎉 Your phone should ring in a few seconds!")
    print(f"   You'll hear a short Twilio demo message.")
except Exception as e:
    print(f"❌ Failed: {e}")
    if "not verified" in str(e).lower() or "21219" in str(e):
        print("\n💡 Fix: Go to Twilio Console → Verified Caller IDs → add this number")
    elif "authenticate" in str(e).lower():
        print("\n💡 Fix: Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env")

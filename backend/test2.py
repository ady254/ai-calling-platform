from dotenv import load_dotenv
load_dotenv()
import os
from elevenlabs.client import ElevenLabs
client = ElevenLabs(api_key=os.environ['ELEVENLABS_API_KEY'])
try:
    print("Testing get_all")
    voices = client.voices.get_all()
    print("Voices fetched:", len(voices.voices))
except Exception as e:
    import traceback
    traceback.print_exc()

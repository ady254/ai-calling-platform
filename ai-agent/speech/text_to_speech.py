import os
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play

load_dotenv()

client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

def speak(text):
    audio = client.text_to_speech.convert(
        text=text,
        voice_id="Bella", # Assuming Rachel is a valid ID or name that works in this context
        model_id="eleven_multilingual_v2"
    )
    play(audio)
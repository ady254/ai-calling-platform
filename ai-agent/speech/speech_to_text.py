from deepgram import DeepgramClient
import os
from dotenv import load_dotenv

load_dotenv()

dg = DeepgramClient()

async def transcribe(audio):
    response = dg.listen(audio)
    return response["text"]
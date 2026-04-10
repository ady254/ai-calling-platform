import asyncio
import os
import logging
from dotenv import load_dotenv
from livekit.plugins.google.beta import GeminiTTS

load_dotenv()
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger("test-tts")

async def test_tts():
    try:
        print("Initializing GeminiTTS...")
        tts = GeminiTTS(
            model="gemini-2.5-flash-preview-tts",
            voice_name="Kore"
        )
        print("Synthesizing...")
        stream = tts.synthesize("Hello, I am testing the Gemini TTS engine. This is a voice check.")
        
        # In GeminiTTS, synthesize returns a ChunkedStream which is an async iterable
        async for chunk in stream:
            print(f"Received chunk! size: {len(chunk.audio) if hasattr(chunk, 'audio') else 'unknown'}")
        
        print("Test complete!")
    except Exception as e:
        logger.exception("Error during TTS test")

if __name__ == "__main__":
    asyncio.run(test_tts())

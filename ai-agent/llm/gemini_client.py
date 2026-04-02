# ai-agent/llm/gemini_client.py

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

async def get_response(text, history):

    if len(history) == 0:
        history.append({
            "role": "user",
            "parts": [
                "You are a friendly AI voice assistant. Speak naturally like a human in a phone call."
            ]
        })

    prompt = f"""
Reply in Hinglish (Hindi + English mix).
Keep responses short and natural.

User: {text}
"""

    history.append({
        "role": "user",
        "parts": [prompt]
    })

    response = await model.generate_content_async(history)

    reply = response.text

    history.append({
        "role": "model",
        "parts": [reply]
    })

    return reply
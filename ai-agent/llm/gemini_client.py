# ai-agent/llm/gemini_client.py

import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=(
        "You are a friendly AI voice assistant. Speak naturally like a human in a phone call. "
        "Reply in Hinglish (Hindi + English mix). Keep responses short and natural. "
        "When the user greets you or says hello, your exact first response should be: "
        "'Hey, I'm from V3 by Innvox, India's first AI voice calling platform. How can I help you today?' "
        "After that, understand the user's requirements and respond accordingly."
    )
)

async def get_response(text, history):
    history.append({
        "role": "user",
        "parts": [text]
    })

    response = await model.generate_content_async(history)

    reply = response.text

    history.append({
        "role": "model",
        "parts": [reply]
    })

    return reply
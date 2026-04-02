import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")


async def generate_ai_response(message: str):

    response = await model.generate_content_async(
        f"You are a professional sales calling agent.\nUser: {message}"
    )

    return response.text
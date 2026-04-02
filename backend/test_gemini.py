import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    model = genai.GenerativeModel("gemini-2.5-flash")
    print("Model initialized successfully (unexpected)")
except Exception as e:
    print(f"Error: {e}")

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("gemini-1.5-flash initialized successfully")
except Exception as e:
    print(f"Error with 1.5-flash: {e}")

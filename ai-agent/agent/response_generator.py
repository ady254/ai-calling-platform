from llm.gemini_client import get_response

class ResponseGenerator:
    def __init__(self):
        self.chat_history = []

    async def generate(self, text):
        response = await get_response(text, self.chat_history)
        return response
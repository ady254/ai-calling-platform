import asyncio
from llm import get_response

async def main():
    history = []
    try:
        reply = await get_response("Hello, who are you?", history)
        print(f"AI: {reply}")
        print(f"History Length: {len(history)}")
        
        reply2 = await get_response("What did I just ask?", history)
        print(f"AI: {reply2}")
        print(f"History Length: {len(history)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

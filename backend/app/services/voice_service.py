from gtts import gTTS
import os


def text_to_speech(text: str, filename="output.mp3"):

    tts = gTTS(text=text, lang="en")

    file_path = f"audio/{filename}"

    os.makedirs("audio", exist_ok=True)

    tts.save(file_path)

    return file_path
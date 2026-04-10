import os
from livekit.plugins import google
import inspect
import sys

print("Google TTS signature:")
print(inspect.signature(google.TTS.__init__))
sys.exit(0)

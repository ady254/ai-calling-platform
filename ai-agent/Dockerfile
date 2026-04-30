FROM python:3.12-slim

WORKDIR /app

# Install system dependencies required by LiveKit agents (audio processing)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libopus0 \
    libopusfile0 \
    ffmpeg \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# LiveKit agent worker — auto-connects to rooms
CMD ["python", "main.py", "start"]

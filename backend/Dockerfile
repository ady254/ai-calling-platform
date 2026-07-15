FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create audio directory for TTS output
RUN mkdir -p audio

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Apply database migrations, then serve.
#
# Without this a fresh environment has no schema and every request 500s — the
# image ships Alembic (see requirements.txt) and alembic.ini sits at /app, so
# `alembic upgrade head` resolves the single head from /app/alembic/versions.
# `alembic/env.py` reads DATABASE_URL from the environment.
#
# Fails fast: if the migration fails we exit non-zero rather than serve an app
# against a broken schema.
#
# Set RUN_MIGRATIONS=false where a separate migration job owns this (e.g. a
# multi-instance Cloud Run deploy), so replicas don't race each other on DDL.
CMD ["sh", "-c", "if [ \"${RUN_MIGRATIONS:-true}\" = \"true\" ]; then echo 'Applying database migrations...'; alembic upgrade head || exit 1; fi; exec uvicorn app.main:app --host 0.0.0.0 --port 8000"]

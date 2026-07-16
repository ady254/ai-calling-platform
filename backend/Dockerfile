# ─────────────────────────────────────────────────────────────────────
# Build stage — compiles wheels, then gets thrown away.
# ─────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

# build-essential is needed to compile some dependencies, but it must NOT ship
# in the runtime image: it's ~200MB and hands a compiler to anyone who gets
# code execution. Multi-stage keeps it here.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install into a self-contained venv we can copy wholesale into the runtime.
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


# ─────────────────────────────────────────────────────────────────────
# Runtime stage — no compiler, no root.
# ─────────────────────────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Run unprivileged: an RCE or container escape shouldn't land as root.
RUN useradd --create-home --uid 1000 appuser

WORKDIR /app

COPY --from=builder /opt/venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH" \
    # Flush logs immediately — buffered stdout hides output when a container
    # dies, which defeats the logging added in app/core/observability.py.
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# .dockerignore keeps venv/, .env, __pycache__ and .git out of this.
COPY --chown=appuser:appuser . .

# TTS output dir, writable by the non-root user.
RUN mkdir -p audio && chown appuser:appuser audio

USER appuser

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

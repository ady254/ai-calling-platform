# Deployment Plan — AI Calling Platform

This document explains **what runs where**, **why**, and the **step-by-step path** to get
off your laptop and onto stable infrastructure with a permanent HTTPS URL (which
kills the ngrok-restart dance — roadmap item #3).

> Free-tier limits and credit amounts below are approximate and change over time.
> Google's free trial is commonly **$300 for 90 days** (you mentioned $200 — the plan
> works either way). Treat exact numbers as "verify at signup," but the placement logic
> is stable.

---

## 1. What you are actually deploying

The platform is **five deployable units** plus a set of external SaaS APIs you do *not*
host (they stay as-is): LiveKit Cloud, Twilio, Gemini, ElevenLabs, Deepgram.

| # | Unit | What it is | Runtime shape | Needs |
|---|------|-----------|---------------|-------|
| 1 | **Frontend** | Next.js 15 dashboard (`output: standalone`) | Stateless web, edge-friendly | Build-time `NEXT_PUBLIC_*` env |
| 2 | **Backend API** | FastAPI + uvicorn | HTTP server, **needs stable public HTTPS** for Twilio webhooks | Postgres, Redis, all API keys |
| 3 | **ARQ worker** | `arq app.worker.WorkerSettings` | **Always-on** background process, no HTTP | Postgres, Redis |
| 4 | **AI agent** | `python main.py start` (LiveKit worker) | **Always-on**, holds a persistent outbound WebSocket to LiveKit Cloud; not an HTTP server | Redis(optional), LiveKit, Gemini, Deepgram, ElevenLabs, reaches Backend |
| 5 | **Postgres + Redis** | State + arq queue | Managed stateful services | — |

**The single fact that decides everything:** units 3 and 4 are *persistent processes*,
and unit 2 needs a *stable HTTPS URL*. Serverless/free tiers that sleep or forbid
long-running workers cannot host 3 and 4 for free. That is what steers the split below.

---

## 2. Recommended placement (the "where")

| Component | Host | Tier / cost | Why here |
|-----------|------|-------------|----------|
| **Frontend** | **Vercel** | Free (Hobby) — permanent | It *is* Next.js. Auto HTTPS, global CDN, git-push deploys. Zero reason to host it anywhere else. |
| **Backend API** | **GCP** | Free credit | Needs always-capable compute + stable HTTPS. The credit is the right tool for "real compute I don't want to pay for yet." |
| **ARQ worker** | **GCP** | Free credit | Always-on persistent process — cannot be free on Vercel (serverless) or Render (workers are paid). |
| **AI agent** | **GCP** | Free credit | Same: persistent WebSocket worker, must stay always-on. |
| **Postgres** | **Neon** (or Supabase) | Free — permanent | Keep state **off** the GCP credit so it survives after the 90 days and doesn't burn credit. Public TLS, no VPC needed. |
| **Redis** | **Upstash** | Free — permanent | Serverless Redis over TLS. Also fixes the WSL-Redis reliability problem from local dev. No VPC needed. |

### Why this split, in one paragraph
**Vercel** gets the frontend because that's its native workload and it's free forever.
**GCP's credit** absorbs the three Python services because two of them are always-on
workers that no free serverless tier will run for free — the credit is exactly the
right instrument for that. **Neon + Upstash** hold the stateful pieces on their own
permanent free tiers so (a) they don't consume your GCP credit, (b) they survive after
the credit expires, and (c) using them over public TLS means **you don't need a GCP VPC
connector at all**, which removes the single most fiddly part of a Cloud Run setup.

### Where does Render fit? — It doesn't, for *this* app
Render is great, but a poor shape for this workload's free tier:
- Free **web services sleep after ~15 min idle** → bad for Twilio webhook latency and
  fatal for the always-on LiveKit agent.
- **Background workers are not free** on Render (Starter ≈ $7/mo each) — you'd pay for
  the worker *and* the agent.
- Free **Postgres is deleted after ~30 days**.

So Render's free tier can't run units 3 and 4 for free, which is the whole game. Skip it
in the recommended path. (If you actively dislike GCP, Render *Starter* is a fine paid
alternative for the backend + workers — see §6.)

---

## 3. Within GCP: two paths — pick the VM path first

You have a **working `docker-compose.yml`** already. That makes the choice easy.

### ▶ Path A (recommended now): one GCE VM + docker-compose
One small VM runs backend + worker + agent as containers. Simplest possible ops, stretches
the credit furthest, reuses what you've already built.

- **VM**: `e2-medium` (2 vCPU, 4 GB) ≈ **$25–27/mo** → ~3 months well inside a $300 credit.
  (`e2-small`/2 GB is cheaper but tight once the agent's ~1 GB is loaded — pick medium for headroom.)
- **HTTPS**: put **Caddy** in front (automatic Let's Encrypt certs) on a domain/subdomain →
  gives you the permanent `https://api.yourdomain.com` that Twilio needs.
- **Best for**: your current stage (solo, pre-revenue, validating). No new tooling to learn.
- **Trade-off**: single box, no auto-scaling, you patch the OS. Fine at this scale.

### ▶ Path B (later, when you have load): Cloud Run
Your `terraform/` already targets Cloud Run (backend, frontend, agent) + Cloud SQL +
Memorystore. It auto-scales and gives **automatic HTTPS + stable URLs** with zero cert work.
- **Cost caveat**: the worker and agent must be *always-allocated* (`min-instances=1`,
  `cpu_idle=false`). Two always-on 1-vCPU services ≈ **$90–100/mo** — ~3 months of a $300
  credit. More than the VM, but hands-off and elastic.
- **Migrate to this** when a single VM stops coping, not before.

> ⚠️ **The existing terraform is incomplete** — before using Path B, add the missing env
> vars (see §5.4). As written it would start containers that crash or misbehave.

---

## 4. Step-by-step: the recommended deploy (Vercel + GCP VM + Neon + Upstash)

### Phase 0 — Provision the free managed state (10 min)
1. **Neon**: create a project → copy the connection string. Convert it to asyncpg form for this app:
   `postgresql+asyncpg://USER:PASS@HOST/DB` (drop any `?sslmode=...`; asyncpg negotiates TLS).
2. **Upstash**: create a Redis database → copy the `rediss://...` URL (TLS). Use it as `REDIS_URL`.
3. Sanity-check both are reachable from your laptop before going further.

### Phase 1 — Backend + worker + agent on a GCE VM
1. `gcloud` → create an `e2-medium` VM (Debian/Ubuntu), allow HTTP/HTTPS in the firewall.
2. Install Docker + Docker Compose plugin on the VM.
3. Copy the repo (or `git clone`) to the VM. Create the production `.env` on the box
   (never commit it) — see the pre-flight checklist in §5.
4. Point `DATABASE_URL` → Neon, `REDIS_URL` → Upstash. **Remove the `postgres` and `redis`
   services** from `docker-compose.yml` on the VM (you're using managed ones), and drop the
   `depends_on: postgres/redis` conditions — or make a `docker-compose.prod.yml` override.
5. Add a **Caddy** service (or run Caddy on the host) reverse-proxying `:443 → backend:8000`.
   Set `BASE_URL=https://api.yourdomain.com` and `ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`.
6. `docker compose up -d`. The **backend image runs `alembic upgrade head` on start**
   (the worker's CMD override skips it, so they don't race) → schema is created automatically.
7. Verify: `curl https://api.yourdomain.com/health` → `{"status":"healthy"}`.

### Phase 2 — Point Twilio + LiveKit at the stable URL
1. **Twilio**: set the number's voice/status-callback webhooks to `https://api.yourdomain.com/...`.
   This is the permanent replacement for ngrok — **no more updating `BASE_URL` on every restart.**
2. **LiveKit**: SIP trunk + dispatch rule already exist (`ST_6weUVKbWvoib` / `SDR_kQoP9MN5cZ2E`).
   Confirm the agent connects: the agent container logs should show it registering as a worker.

### Phase 3 — Frontend on Vercel
1. Import the repo in Vercel; set **Root Directory = `frontend`**.
2. Set env vars **before the first build** (they're `NEXT_PUBLIC_*`, inlined at build time):
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - `NEXT_PUBLIC_LIVEKIT_URL=wss://innvox-um8kvrmw.livekit.cloud` (your LiveKit Cloud URL)
3. Deploy. Copy the resulting Vercel URL back into the backend's `ALLOWED_ORIGINS`
   (Phase 1, step 5) and restart the backend so CORS allows it.
4. Optional: add a custom domain to the Vercel project.

### Phase 4 — Create your login (no public signup)
`ALLOW_PUBLIC_SIGNUP` stays **false** in production. Provision accounts by hand:
```
docker compose exec backend python scripts/create_user.py --name "You" --email you@domain.com
```

### Phase 5 — Smoke test
Log in → create a one-contact campaign → start it → confirm a real call connects, the agent
speaks, and a Call History row appears with transcript + extracted outcome.

---

## 5. Pre-flight checklist & gotchas (from hard-won local-dev experience)

### 5.1 Required env vars that will hard-fail if wrong
- **`INTERNAL_API_KEY`** — the app **refuses to start** without a real one (≥32 chars, not the
  placeholder). Generate: `python -c "import secrets; print(secrets.token_hex(32))"`.
  It must be **identical** in the backend *and* the agent env (the agent authenticates to
  `/agent/internal/*` with it).
- **`SECRET_KEY`** — same generation; required for auth tokens.
- **`ALLOW_PUBLIC_SIGNUP=false`** — leaving it true lets anyone register and spend your
  Twilio/LLM budget.

### 5.2 The Gemini key name trap
The LiveKit `google` plugin (used by the agent) prefers **`GOOGLE_API_KEY`**, while the
backend uses `GEMINI_API_KEY`. Set **both to the same valid key** in every environment — an
invalid `GOOGLE_API_KEY` once silently broke the agent while `GEMINI_API_KEY` was fine.

### 5.3 The agent needs more keys than the backend
The agent talks to Deepgram + ElevenLabs + Gemini directly. Its environment must include
`DEEPGRAM_API_KEY`, `ELEVEN_API_KEY`, `GOOGLE_API_KEY`/`GEMINI_API_KEY`, `INTERNAL_API_KEY`,
`LIVEKIT_*`, and `BACKEND_URL` (internal URL of the backend). Also: **voice IDs must be real
ElevenLabs IDs** (e.g. `qtqlHrXyBpEXHx2JBPgx`) — OpenAI-style names like "alloy" crash TTS.

### 5.4 The terraform (Path B) is missing env vars — add before using
As written, `terraform/cloud_run.tf` omits several **required** vars:
- **backend** is missing: `INTERNAL_API_KEY`, `SECRET_KEY`, `DEEPGRAM_API_KEY`,
  `ELEVEN_API_KEY`, `BASE_URL`, `ALLOWED_ORIGINS`. (Backend won't start without the first two.)
- **ai-agent** is missing: `INTERNAL_API_KEY`, `DEEPGRAM_API_KEY`, `ELEVEN_API_KEY`,
  `GOOGLE_API_KEY`. (Agent can't authenticate to the backend or run STT/TTS without these.)
- Put secrets in **Google Secret Manager** and reference them, rather than plaintext `value =`
  in the tf files.

### 5.5 Migrations ownership on multi-instance (Path B only)
The backend image runs `alembic upgrade head` on boot. On Cloud Run with >1 backend instance,
set **`RUN_MIGRATIONS=false`** and run migrations as a **one-off Cloud Run Job** so replicas
don't race on DDL. On the single-VM path (A) this is a non-issue — one backend container owns it.

### 5.6 Arabic calls
If you call Arabic numbers, run the agent with `PYTHONIOENCODING=utf-8` (already implied by
`PYTHONUNBUFFERED` in Docker, but set it explicitly on the agent) — Windows-only crash, but
harmless to set on Linux.

---

## 6. Cost summary (approximate, at time of writing)

| Layer | Recommended | Monthly | Notes |
|-------|-------------|---------|-------|
| Frontend | Vercel Hobby | **$0** | Permanent free. Commercial scale later → Pro $20/mo. |
| Backend+worker+agent | GCE `e2-medium` | **~$25–27** | Covered by GCP credit ~3 mo (Path A). |
| Postgres | Neon free | **$0** | Permanent. |
| Redis | Upstash free | **$0** | Permanent. |
| LiveKit Cloud | Free tier | **$0**\* | \*Metered minutes cap; upgrade when call volume grows. |
| Twilio | Pay-as-you-go | ~$1/number + per-min | Not free; unavoidable for real PSTN calls. |
| Gemini | Free tier | **$0**\* | \*20 req/min cap; heavy test-calling hits 429s → billing upgrade is the real fix. |
| ElevenLabs / Deepgram | Metered | usage-based | Small at validation volume. |

**Net infra you pay out-of-pocket during validation ≈ Twilio + a little STT/TTS.** Everything
else rides free tiers or the GCP credit. When the credit expires, only the GCE VM needs a card
(~$27/mo) — Neon/Upstash/Vercel stay free.

---

## 7. Upgrade path (when validation succeeds)
1. **Backend/agent outgrow one VM** → move units 2–4 to **Cloud Run** (Path B; fix terraform §5.4 first).
2. **Call concurrency** → the executor is currently ~sequential (roadmap #6); add bounded
   parallel dialing before scaling the agent horizontally.
3. **Reliability** → wire `SENTRY_DSN` + `ENVIRONMENT=production` + `LOG_FORMAT=json` (already
   supported in code) so API and worker exceptions are captured.
4. **Managed state at scale** → Neon/Upstash paid tiers, or Cloud SQL + Memorystore if you've
   already committed to Cloud Run (then you *do* add a VPC connector).

---

*Related: `docs/ONBOARDING.md`, `terraform/`, `docker-compose.yml`*

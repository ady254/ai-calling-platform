# Beginner Deployment Roadmap 🚀

A friendly, step-by-step path to put this project on the internet for the first time.
No prior cloud experience assumed. Each phase tells you the **goal**, the **why**, the
**exact steps**, and **how to know it worked** before you move on.

> **The plan in one sentence:** rent **one always-on computer** in Google Cloud that runs
> your whole backend (with `docker compose up`, exactly like on your laptop), and put the
> **website** on Vercel for free. That's it — two homes.

⏱️ **Total time:** ~2–3 hours if it's your first time. Go phase by phase. Don't skip checkpoints.

---

## Part 1 — The big picture (read this first, 5 min)

Think of your project like a small **call centre**:

| Part of your code | What it does (plain words) | Where it will live |
|---|---|---|
| **Frontend** | The website you log into and click buttons on | **Vercel** (free) |
| **Backend (API)** | The "office manager" — takes requests, talks to the database, tells Twilio to make calls | **Google Cloud server** |
| **Worker** | The "dialer" — works through your contact list in the background | **Google Cloud server** |
| **AI agent** | The "voice on the phone" — listens, thinks, speaks | **Google Cloud server** |
| **Database (Postgres)** | The "filing cabinet" — stores users, campaigns, call logs | **Google Cloud server** |
| **Redis** | The "sticky-note board" — the job queue the worker reads from | **Google Cloud server** |

And these you **do NOT install** — they're services you just get keys for and call over the
internet: **Twilio** (phone calls), **LiveKit** (audio pipes), **Gemini** (the AI brain),
**ElevenLabs** (the voice), **Deepgram** (turns speech into text).

```mermaid
flowchart LR
    User[You in a browser] --> Vercel[Frontend on Vercel]
    Vercel -->|API calls| Server
    subgraph Server[One Google Cloud Server - runs docker compose]
        Backend[Backend API] --- Worker[Worker]
        Backend --- DB[(Postgres)]
        Backend --- Redis[(Redis)]
        Agent[AI Agent]
    end
    Backend -->|make a call| Twilio
    Twilio -->|webhook: call status| Backend
    Agent <-->|audio| LiveKit
    Agent --> Gemini & ElevenLabs & Deepgram
```

**Why one server for the back-end stuff?** The Worker and AI agent must run **all the time**
(waiting for calls). Free "serverless" hosts go to sleep, which breaks that. One small
always-on computer is the simplest thing that works — and it's basically your laptop's
`docker compose up`, but in the cloud and never turned off.

---

## Part 2 — Your shopping list (do before Phase 1)

### Accounts to create (all free to start)
- [ ] **Google Cloud** account (this gives you the free credit — usually ~$300 for 90 days).
      You'll need to add a card, but the credit covers everything here.
- [ ] **Vercel** account (sign in with GitHub — easiest).
- [ ] A **domain name** — buy a cheap one (a `.xyz` is often ~$1–3/year) from Namecheap,
      Cloudflare, or similar. You need this so calls can reach your server over secure `https`.
      *(You already own a domain? Use a subdomain like `api.yourdomain.com`.)*

### Keys to collect into ONE notepad file (you already have most in your local `.env`)
Open your project's `.env` and copy these values somewhere safe — you'll paste them onto the
server later:
- `SECRET_KEY`, `INTERNAL_API_KEY` (⚠️ must be long & random — see Phase 3)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `LIVEKIT_SIP_DOMAIN`
- `GEMINI_API_KEY` (**and** copy the same value into a `GOOGLE_API_KEY` — see the note in Phase 3)
- `ELEVEN_API_KEY`, `DEEPGRAM_API_KEY`
- `DB_PASSWORD` (make up a new strong one for the cloud database)

> 🔒 **Never** commit this file or paste these keys into a chat/website. They're like passwords.

---

## Part 3 — The phases

Each phase builds on the last. Do them in order.

---

### Phase 1 — Rent your always-on server ⏱️ ~20 min · difficulty: 🟢 easy

**Goal:** get one small Linux computer running in Google Cloud that you can log into.

**Why:** this is the "always-on laptop in the cloud" that will run your backend.

**Steps:**
1. In the Google Cloud Console, create a new **Project** (name it e.g. `ai-calling`).
2. Go to **Compute Engine → VM instances → Create Instance**.
   - **Machine type:** `e2-medium` (2 vCPU, 4 GB RAM). This is enough to run everything.
   - **Boot disk:** Ubuntu 24.04 LTS, 30 GB.
   - **Firewall:** tick **Allow HTTP** and **Allow HTTPS**.
   - Create it.
3. When it's running, note its **External IP address** (e.g. `34.x.x.x`).
4. Click the **SSH** button next to the VM — a terminal opens in your browser. You're now
   "inside" your cloud computer.

**✅ Done when:** the browser SSH terminal is open and typing `whoami` prints a username.

---

### Phase 2 — Install Docker on the server ⏱️ ~10 min · difficulty: 🟢 easy

**Goal:** put Docker on the server so it can run your containers.

**Why:** your project ships as Docker containers (`docker-compose.yml`). The server needs
Docker to run them, just like your laptop does.

**Steps (paste into the browser SSH terminal, one block):**
```bash
# Install Docker + the compose plugin (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```
Then **close the SSH tab and reopen it** (so the group change takes effect), and verify:
```bash
docker --version
docker compose version
```

**✅ Done when:** both commands print version numbers with no "permission denied" error.

---

### Phase 3 — Put your code + secrets on the server ⏱️ ~30 min · difficulty: 🟡 medium

**Goal:** get your project onto the server and create its production `.env`.

**Why:** the server needs your code and your keys to run.

**Steps:**
1. Get the code onto the server. Easiest is Git:
   ```bash
   git clone <your-repo-url> ai-calling
   cd ai-calling
   ```
   *(If your repo is private, use a GitHub personal-access-token in the URL, or upload a zip.)*

2. Create the production `.env` file:
   ```bash
   cp .env.example .env
   nano .env      # a simple text editor; Ctrl+O to save, Ctrl+X to exit
   ```

3. Fill in `.env` using your notepad from Part 2, **plus these production-specific values**:

   | Variable | Set it to | Why |
   |---|---|---|
   | `SECRET_KEY` | a fresh random string | run `openssl rand -hex 32` on the server and paste the output |
   | `INTERNAL_API_KEY` | a fresh random string (≥32 chars) | run `openssl rand -hex 32` again. **The app refuses to start without a real one.** |
   | `DB_PASSWORD` | your new strong DB password | used by the Postgres container |
   | `DATABASE_URL` | `postgresql+asyncpg://postgres:YOUR_DB_PASSWORD@postgres:5432/aicalling` | `postgres` is the container name, not localhost |
   | `REDIS_URL` | `redis://redis:6379` | `redis` is the container name |
   | `GOOGLE_API_KEY` | **same value as** `GEMINI_API_KEY` | ⚠️ the AI agent's Google plugin reads `GOOGLE_API_KEY`; keep both set to the same key or the agent breaks silently |
   | `BASE_URL` | `https://api.yourdomain.com` | your domain from Part 2 (you'll point it at the server in Phase 4) |
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | your Vercel URL (you'll get it in Phase 6 — you can update this later) |
   | `ALLOW_PUBLIC_SIGNUP` | `false` | so strangers can't register and spend your call budget |
   | `ENVIRONMENT` | `production` | |
   | `LOG_FORMAT` | `json` | cleaner logs for a server |

**✅ Done when:** `.env` is saved with real values (no `YOUR_...` placeholders left) and
both `SECRET_KEY` and `INTERNAL_API_KEY` are long random strings.

---

### Phase 4 — Point your domain at the server + turn on HTTPS ⏱️ ~25 min · difficulty: 🟡 medium

**Goal:** make `https://api.yourdomain.com` reach your server securely.

**Why:** Twilio will send call updates ("the person answered", "the call ended") to your
backend as **webhooks**, and it needs a real, secure `https://` address — not `localhost`
and not ngrok. This is the step that finally ends the ngrok-restart headache.

**Steps:**
1. **DNS:** in your domain provider's dashboard, add an **A record**:
   - Name: `api`  ·  Value: your server's External IP (from Phase 1)  ·  Save.
   - Wait a few minutes for it to take effect.

2. **Caddy** is a tiny web server that automatically gets a free HTTPS certificate for you.
   Add it to your stack. On the server, create a file named `Caddyfile` in the project folder:
   ```bash
   nano Caddyfile
   ```
   Put in exactly this (replace the domain):
   ```
   api.yourdomain.com {
       reverse_proxy backend:8000
   }
   ```
   Save and exit.

3. Add Caddy to your compose stack. Create `docker-compose.prod.yml`:
   ```bash
   nano docker-compose.prod.yml
   ```
   Paste:
   ```yaml
   services:
     caddy:
       image: caddy:2-alpine
       restart: unless-stopped
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./Caddyfile:/etc/caddy/Caddyfile:ro
         - caddy_data:/data
       networks:
         - aicalling-net
     # We host the website on Vercel, so don't run the frontend container here.
     frontend:
       profiles: ["disabled"]
   volumes:
     caddy_data:
   ```
   *(The `frontend` override just switches off the website container — Vercel handles that.)*

**✅ Done when:** the DNS A record is saved. (You'll confirm HTTPS works at the end of Phase 5.)

---

### Phase 5 — Start everything ⏱️ ~10 min · difficulty: 🟢 easy

**Goal:** launch the whole backend with one command.

**Why:** this is the payoff — the same `docker compose up` you know, now in the cloud.

**Steps:**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```
- `-d` = run in the background. `--build` = build your images first (takes a few minutes the first time).
- The **backend automatically creates the database tables** on startup (Alembic migrations) —
  you don't run anything by hand.

Watch it come alive:
```bash
docker compose ps            # all services should say "running"/"healthy"
docker compose logs -f backend   # Ctrl+C to stop watching
```

**✅ Done when:** in your own browser (not the server), visiting
`https://api.yourdomain.com/health` shows `{"status":"healthy",...}` with a padlock 🔒.
If the padlock/HTTPS isn't ready, wait 1–2 minutes (Caddy is fetching the certificate) and retry.

---

### Phase 6 — Deploy the website to Vercel ⏱️ ~15 min · difficulty: 🟢 easy

**Goal:** put the dashboard online for free.

**Why:** Vercel is built for Next.js — this is the easiest part.

**Steps:**
1. In Vercel: **Add New → Project → Import** your GitHub repo.
2. Set **Root Directory = `frontend`** (important — your website lives in that subfolder).
   Vercel will auto-detect Next.js + pnpm.
3. Add **Environment Variables** (before deploying):
   - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com`
   - `NEXT_PUBLIC_LIVEKIT_URL` = your `LIVEKIT_URL` value (e.g. `wss://innvox-um8kvrmw.livekit.cloud`)
4. Click **Deploy**. Vercel gives you a URL like `https://your-app.vercel.app`.
5. **Go back to the server**, put that Vercel URL into `ALLOWED_ORIGINS` in `.env`, and restart the backend:
   ```bash
   nano .env      # update ALLOWED_ORIGINS
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend
   ```
   *(This lets your website talk to your backend — without it the browser blocks the requests for security. This is called CORS.)*

**✅ Done when:** the Vercel URL opens your dashboard's login page.

---

### Phase 7 — Connect Twilio + LiveKit to your new address ⏱️ ~15 min · difficulty: 🟡 medium

**Goal:** tell the phone services where your live backend is.

**Why:** they were pointing at your laptop/ngrok before. Now they point at your permanent URL.

**Steps:**
1. **Twilio Console → your phone number → Voice settings:** set the webhook/status-callback
   URLs to your `https://api.yourdomain.com/...` endpoints (the same paths you used locally,
   just with the new domain).
2. **LiveKit:** your SIP trunk + dispatch rule already exist. Just confirm the agent connected —
   check its logs on the server:
   ```bash
   docker compose logs ai-agent | tail -30
   ```
   You should see it register as a worker (no crash, no auth errors).

**✅ Done when:** Twilio webhooks point to your domain and the ai-agent logs show it's connected.

---

### Phase 8 — Create your login + make a test call ⏱️ ~10 min · difficulty: 🟢 easy

**Goal:** prove the whole thing works end-to-end.

**Steps:**
1. Public signup is off (good), so create your account from the server:
   ```bash
   docker compose exec backend python scripts/create_user.py --name "You" --email you@you.com
   ```
   It prints a generated password — **copy it now** (it can't be recovered later). Or add
   `--password 'YourChoice!'` to set your own.
2. Open your Vercel URL, log in with those credentials.
3. Create a campaign with **one contact (your own phone number)**, and start it.

**✅ Done when:** your phone rings, the AI talks to you, and afterwards a row appears in
**Call History** with a transcript and an outcome. 🎉 **You're deployed.**

---

## Part 4 — Running it day-to-day (bookmark this)

All commands run in the server's SSH terminal, inside the `ai-calling` folder.

| I want to… | Command |
|---|---|
| See if everything's running | `docker compose ps` |
| Watch backend logs live | `docker compose logs -f backend` |
| Watch the AI agent (where call bugs show up) | `docker compose logs -f ai-agent` |
| Restart after changing `.env` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| Pull new code and redeploy | `git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build` |
| Stop everything | `docker compose down` |

### When a call fails — check in this order (this catches ~every past bug)
1. Is `BASE_URL` in `.env` exactly your `https://api.yourdomain.com`? Did you restart the backend after editing?
2. `docker compose logs -f ai-agent` — the real error almost always shows here, not in Twilio.
3. Is `GOOGLE_API_KEY` set to the **same valid key** as `GEMINI_API_KEY`? A bad `GOOGLE_API_KEY`
   breaks the agent silently.
4. Are your campaign **voice IDs real ElevenLabs IDs** (like `qtqlHrXyBpEXHx2JBPgx`)? Names like
   "alloy" crash the voice.

---

## Part 5 — Don't get a surprise bill 💸

- **Set a budget alert:** Google Cloud → Billing → Budgets & alerts → create a budget (e.g. $50)
  with an email alert at 50% / 90% / 100%. Do this in Phase 1 — it's your safety net.
- **What costs money:** the server (~$25–27/month, paid from your free credit for the first ~3
  months) and **Twilio** (a phone number ~$1/month + a few cents per call minute — this is real
  money from the start, unavoidable for real calls). Gemini/ElevenLabs/Deepgram are tiny at test volume.
- **What's free:** Vercel (website), and Google's credit covers the server during your trial.
- **When the credit runs out:** only the server needs a card (~$27/month). Everything else stays as-is.

---

## Part 6 — "What's next" once this works
You've done the hard part. Later, when you want to level up (see `docs/DEPLOYMENT.md` for the
grown-up version):
1. Move the **database to free Neon** and **Redis to free Upstash** so your data is safe even if
   the server dies.
2. Turn on **Sentry** (error alerts) — set `SENTRY_DSN` in `.env`.
3. Take **snapshots/backups** of the server disk on a schedule.

You don't need any of this to launch. Get Phase 8 working first. 💪

---

*Simplest path summary: **1 Google Cloud server** (runs `docker compose` = backend + worker +
agent + database + redis) · **Vercel** (website) · **1 cheap domain** (for secure webhooks).
The scalable version lives in `docs/DEPLOYMENT.md`.*

# Client Onboarding Runbook

How a new client goes from signed contract to live calls.

## Why this is high-touch

We are not shipping a dashboard. We make **autonomous phone calls on the
client's behalf, under their brand, to their customers**. A bad prompt doesn't
produce a support ticket — it produces a patient with the wrong appointment
time, or a TCPA violation at **$500–$1,500 per call**.

So onboarding is deliberately guided. Self-serve signup is disabled
(`ALLOW_PUBLIC_SIGNUP=false`); accounts are provisioned by us. That is a
deliberate control, not a missing feature.

**~80% of onboarding is identical for every client.** Only the last 20% —
script, knowledge, compliance regime, KPI — changes by sector. That 20% lives in
[sector-packs/](./sector-packs/). Never build a client from scratch: start from
the pack.

---

## Stages at a glance

| # | Stage | Owner | Typical time | Exit criteria |
|---|-------|-------|--------------|---------------|
| 0 | Qualify & contract | Sales | — | Use case, volume, compliance posture known |
| 1 | Provision | Us | 5 min | Credentials issued, number assigned |
| 2 | Kickoff & discovery | Us + client | 45 min | Script, objections, FAQs, hours, KPI captured |
| 3 | Configure agent | Us | 1–3 days | Agent + prompt + voice + knowledge ready |
| 4 | Data & integrations | Both | 1–5 days | Contacts imported, **consent verified** |
| 5 | 🚦 Compliance gate | Us | — | **Hard stop — see below** |
| 6 | Test calls | Us | 1 day | 10–20 internal calls reviewed, prompt tuned |
| 7 | Pilot | Both | 1 week | ~50 real contacts, client signs off |
| 8 | Go-live | Both | — | Full list running, monitoring on |
| 9 | Review & expand | Us | Weekly → QBR | KPI moving; next use case identified |

**Total: 1–2 weeks** for a first client in a new sector. Days once the sector
pack exists.

---

## Stage 0 — Qualify & contract

- [ ] Sector identified → does a [sector pack](./sector-packs/) exist?
- [ ] Use case is **one** clear job (not "AI for everything")
- [ ] Expected monthly call volume (drives cost + rate limits)
- [ ] **Where do their phone numbers come from?** (see Stage 5 — ask early, it kills deals late)
- [ ] Healthcare? → **BAA required before any data changes hands.** No BAA, no deal.

---

## Stage 1 — Provision

Create the account. This also auto-creates their `Business`, so the dashboard
works immediately.

```bash
# ⚠️ Runs against whatever DATABASE_URL points at.
# On your laptop this creates the user in your LOCAL database, not production.
docker compose exec backend python scripts/create_user.py \
  --name "Acme Health" --email ops@acme.com
```

The password is printed **once** and stored bcrypt-hashed — it cannot be
recovered later.

- [ ] Account created against the **correct** database
- [ ] Credentials sent over a secure channel (1Password link / Signal — not plain email)
- [ ] `Business.industry` and `default_language` set to match the sector pack
- [ ] Twilio number provisioned + caller ID verified *(manual — see Known Gaps)*
- [ ] Client can log in at `/login`

---

## Stage 2 — Kickoff & discovery (45 min call)

This call is the whole product. Everything downstream is transcription of it.

Capture:
- [ ] **The job**: what one outcome should the AI achieve?
- [ ] **Success metric**: the number that must move (see the pack's KPI)
- [ ] **The script**: how do their humans open the call today?
- [ ] **Top 5 objections** and the answers they accept
- [ ] **Top 10 FAQs** → becomes the knowledge base
- [ ] **Calling hours + timezone** (the pack has a default; confirm it)
- [ ] **Escalation**: what happens when the AI can't handle it? Who gets it?
- [ ] **Brand**: tone, how the AI introduces itself, what it must never say

> Ask them to **record one real call** from their team. It's worth more than an
> hour of description.

---

## Stage 3 — Configure the agent

Start from the sector pack, then customise.

- [ ] Agent created (Dashboard → Agent Configuration)
- [ ] Prompt = pack template + their script/objections
- [ ] **AI disclosure line present in the prompt** (legally required in a growing
      number of jurisdictions — it is in every pack template; do not remove it)
- [ ] Voice + language set (`Business.default_language`)
- [ ] Knowledge base = their FAQs *(currently: fold into the prompt — see Known Gaps)*
- [ ] Retry policy agreed (default 2 attempts)

---

## Stage 4 — Data & integrations

- [ ] Contacts imported (Dashboard → Contacts → Import CSV)
  - Required columns: `name`, `phone_number`
  - Optional: `email`, `company`, `tags`
  - **Any extra column is preserved as a per-contact variable** and can be used
    in the prompt as `{{column_name}}` — e.g. `doctor_name`, `appointment_date`.
    This is how personalisation works; use it.
- [ ] Phone numbers are **E.164** (`+14155550142`) — bad formats fail silently at Twilio
- [ ] Dead/duplicate numbers cleaned (expect 5–15% junk in any real list)
- [ ] Calendar / CRM integration if the pack calls for one

---

## Stage 5 — 🚦 Compliance gate (HARD STOP)

**Do not proceed to a single real call until every box is ticked.**
"The client insisted" is not a defence.

- [ ] **Consent**: documented basis for calling *these* numbers. Ask
      "where did this list come from?" and do not accept a shrug.
      - Existing patients/customers being reminded → low risk
      - Purchased or scraped lists → **stop**
- [ ] **DNC**: list scrubbed against Do-Not-Call *(manual — see Known Gaps)*
- [ ] **Calling hours** comply with local law (US TCPA: 8am–9pm **recipient's** time)
- [ ] **AI disclosure** present in the prompt
- [ ] **Sector-specific** requirement from the pack satisfied
      (healthcare → **signed BAA**; education → FERPA/parental consent)
- [ ] Opt-out path works: a "do not call me" during a call marks the contact
      `do_not_call` and it is never dialled again

Sign-off (name + date): ______________________

---

## Stage 6 — Test calls

- [ ] 10–20 calls to **internal numbers only**
- [ ] Review transcripts (Dashboard → Call logs → View Details)
- [ ] Check: pronunciation of company/clinic name, opening length, objection
      handling, does it actually book/qualify?
- [ ] Prompt tuned and re-tested

---

## Stage 7 — Pilot (~50 real contacts)

**Never skip this.** At 50 contacts, a broken CSV or a mispronounced clinic name
costs an afternoon. At 10,000, it costs the account.

- [ ] ~50 contacts, lowest-risk segment
- [ ] Watch the first calls **live**
- [ ] Review every transcript
- [ ] Client signs off on quality — in writing
- [ ] Pack's KPI baseline recorded (so you can prove improvement later)

---

## Stage 8 — Go-live

- [ ] Full list uploaded, campaign scheduled within the agreed hours
- [ ] Volume ramped (don't go 50 → 10,000 in one step)
- [ ] Alerting on failure rate
- [ ] Client knows how to pause the campaign themselves

---

## Stage 9 — Review & expand

- [ ] Week 1: daily check-in
- [ ] Weeks 2–4: weekly — report the pack's KPI, not call counts.
      Clients care about no-shows and booked meetings, not minutes.
- [ ] Then: QBR + identify the next use case
- [ ] Feed learnings **back into the sector pack** — that's how onboarding gets
      faster for the next client

---

## Known gaps (do these manually for now)

Be honest with clients about these; don't pretend they're automated.

| Step | Status | Workaround |
|------|--------|------------|
| Knowledge base | Not built | Fold FAQs into the agent prompt |
| Phone number provisioning | Manual | Provision in the Twilio console, set `TWILIO_PHONE_NUMBER` |
| Consent / DNC tracking | **Not built** | Track in a spreadsheet; tag contacts; scrub before import |
| Client password change | Not built | You currently know their password — rotate via DB until built |
| Per-tenant usage cap | Not built | Watch Twilio spend manually; a runaway campaign bills **us** |
| Session length | 60 min, no refresh | Warn them they'll be logged out hourly |

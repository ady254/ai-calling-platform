# Sector Pack — Real Estate (Lead Qualification)

**Status:** draft — validate with the first live client
**Business.industry value:** `Real Estate`

> ⚠️ **This is our highest legal-risk sector.** Healthcare *sounds* scarier
> because of HIPAA, but the calling itself is low-risk there — we're reminding
> patients about appointments they booked. Here we're often calling people who
> never asked to hear from us. That's exactly what TCPA exists to punish, at
> **$500–$1,500 per call**, and it stacks per call in class actions.
>
> The consent question in Stage 5 is not a formality in this sector. It is the
> deal.

---

## 1. The job

Qualify inbound/aged leads — are they actually looking to buy or sell, in what
timeframe — and book the good ones with an agent.

## 2. Primary KPI

**Qualified leads → booked appointments per week.** Agents measure themselves in
appointments, not conversations.

| Metric | Baseline (before us) | Target |
|--------|----------------------|--------|
| Leads contacted per agent/week | Ask at kickoff | 10× (agents call ~40/day at best) |
| Lead → appointment rate | Ask at kickoff | Match or beat their human baseline |
| Speed-to-lead | Often hours/days | < 5 min |

> Speed-to-lead is the strongest pitch here: contacting a web lead in under 5
> minutes vs. an hour is a step-change in conversion, and it's precisely what a
> human team can't do reliably. Sell that.

## 3. Compliance requirements 🔴🔴

- **Consent basis:** must be established **per list**. Ask bluntly:
  *"Where did these numbers come from?"*
  - ✅ Inbound web enquiry, existing client, past customer → defensible
  - ⚠️ Aged leads bought from a vendor → **stop.** Get written proof of consent.
  - 🛑 Scraped, purchased cold lists, expired listings → **refuse the work.**
- **Sector regulation:** **TCPA + DNC registry** (US), plus state mini-TCPA laws
  (Florida and Oklahoma are stricter than federal)
- **Blocking prerequisite:** documented consent basis + DNC scrub
- **Risk level:** **high** — highest of any sector we serve
- **Notes:**
  - Real estate is a **top-3 TCPA litigation target**. Plaintiff firms actively
    hunt this exact use case.
  - Agents will push to "just call the list." The answer is no. One bad list can
    cost more than the account earns in years.
  - DNC scrubbing is **not built** — it must happen before import (see Known Gaps).

## 4. Prompt template

```
You are calling on behalf of {{business_name}}.

Open by identifying yourself as an automated assistant and stating why you're
calling — reference their enquiry. (Required disclosure — do not remove.)

Goal: find out if they're actively buying or selling, their timeframe and area,
then book a call with an agent if they're a fit.

Personalisation from CSV columns:
  {{name}}, {{property_address}}, {{enquiry_date}}, {{agent_name}}

Rules:
- Reference the enquiry immediately: "you enquired about {{property_address}}".
  A cold-sounding opener kills the call and invites complaints.
- Keep the opening under 10 seconds.
- Qualify before pitching: timeframe, area, buying or selling.
- Do NOT discuss price, valuation or offers — book the agent instead.
- If they ask not to be contacted again, confirm politely and end the call.
```

## 5. Knowledge base starter

1. *"How did you get my number?"* → **The most-asked question here.** Answer
   honestly and specifically: reference the enquiry and date. If we can't answer
   this cleanly, we shouldn't be calling.
2. *"What's the property worth?"* → Escalate to agent. Never estimate.
3. *"Is it still available?"* → From the client's feed, else escalate.
4. *"What's the commission?"* → Client's standard rate, else escalate.
5. *"I'm already working with an agent"* → Politely close → `not_interested`.

## 6. Top objections

| Objection | Response that works |
|-----------|---------------------|
| "How did you get my number?" | Cite the enquiry + date. If unclear → stop, mark `do_not_call`. |
| "I'm just browsing" | Capture timeframe, offer to follow up later → `callback_requested`. |
| "I already have an agent" | Close politely → `not_interested`. Don't poach. |
| "Are you a robot?" | Yes — confirm honestly, offer a human. |
| "Take me off your list" | **Immediate** `do_not_call`. No retention attempt, ever. |

## 7. Defaults

| Setting | Value | Why |
|---------|-------|-----|
| Calling hours | 9:00–20:00 **recipient's local time** | TCPA 8am–9pm; timezone is the recipient's, not the client's |
| Best window | **17:00–19:00** | People take property calls after work |
| Voice / tone | Upbeat, efficient, not pushy | Pushy = complaints = litigation |
| Language | `en-US` | |
| Retries | 2 max, ≥24h apart | Repeat calling is itself a TCPA aggravator |

> Note the timezone rule: an agent in California calling a lead in Florida at
> 7pm PT is calling at **10pm ET** — a violation. Confirm the list's timezones.

## 8. Data source & integration

- **Where their contacts live:** CRM (HubSpot, Salesforce, Follow Up Boss, kvCORE)
- **Extra CSV columns to request:** `property_address`, `enquiry_date`,
  `agent_name`, `lead_source` — each becomes a `{{variable}}`
- **`lead_source` and `enquiry_date` are compliance evidence, not nice-to-haves.**
  They're how we answer "how did you get my number?" and how we prove consent.
- **Integration needed:** CRM write-back for qualified leads. Until built,
  outcomes live in `follow_up` and the agent works them manually.

## 9. Outcome mapping

| Real-world result | `outcome` |
|-------------------|-----------|
| Qualified + booked with an agent | `confirmed` |
| Wants a different time to talk | `rescheduled` |
| Interested but not now | `callback_requested` |
| Not looking / has an agent | `not_interested` |
| "Remove me from your list" | `do_not_call` |
| Wrong number | `wrong_person` |
| Hung up early | `incomplete` |

## 10. Lessons learned

- _(append after the first client)_

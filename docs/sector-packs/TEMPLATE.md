# Sector Pack — <Sector Name>

> Copy this file to `<sector>.md` and fill it in the first time you onboard a
> client in a new vertical. From then on, every client in that sector starts
> here instead of from scratch — that's the difference between a 2-week
> onboarding and a 2-day one.
>
> After each client, fold what you learned back into the pack.

**Status:** draft | validated with N clients
**Business.industry value:** `<exact string to set on the Business record>`

---

## 1. The job

One sentence. What single outcome does the AI achieve for this sector?

> _e.g. "Remind patients of upcoming appointments and reschedule if they can't make it."_

## 2. Primary KPI

The number the client actually cares about — report this, not call counts.

| Metric | Baseline (before us) | Target |
|--------|----------------------|--------|
| `<e.g. no-show rate>` | `<x%>` | `<y%>` |

## 3. Compliance requirements

> This section is the gate in [ONBOARDING.md](../ONBOARDING.md) Stage 5.
> If you can't fill it in, you're not ready to sell to this sector.

- **Consent basis:** `<why we're allowed to call these people>`
- **Sector regulation:** `<HIPAA / FERPA / TCPA / GDPR / none>`
- **Blocking prerequisite:** `<e.g. signed BAA — or "none">`
- **Risk level:** low | medium | **high**
- **Notes:** `<what specifically gets you sued in this sector>`

## 4. Prompt template

```
You are calling on behalf of {{business_name}}.

<!-- AI disclosure: legally required in a growing number of jurisdictions.
     Keep it in the opening. Do not remove it. -->
Open by identifying yourself as an automated assistant.

Goal: <the job>

Personalisation available as {{variables}} from the contact's CSV columns:
  {{name}}, {{phone_number}}, <sector-specific: e.g. {{doctor_name}}, {{appointment_date}}>

Rules:
- Keep the opening under <N> seconds.
- <sector rule>
- If the person asks not to be contacted again, confirm politely and end the call.
```

## 5. Knowledge base starter

The 5–10 questions every client in this sector gets asked:

1. `<question>` → `<answer>`
2. …

## 6. Top objections

| Objection | Response that works |
|-----------|---------------------|
| `<objection>` | `<response>` |

## 7. Defaults

| Setting | Value | Why |
|---------|-------|-----|
| Calling hours | `<e.g. 9am–5pm local>` | `<reason>` |
| Best window | `<e.g. 4–6pm>` | `<evidence>` |
| Voice / tone | `<e.g. calm, precise>` | `<reason>` |
| Language | `<e.g. en-US>` | |
| Retries | `<e.g. 2, 4h apart>` | |

## 8. Data source & integration

- **Where their contacts live:** `<EHR / CRM / SIS / POS>`
- **Extra CSV columns to request:** `<e.g. doctor_name, appointment_date>`
  (every non-standard column becomes a `{{variable}}` in the prompt)
- **Integration needed:** `<e.g. calendar write-back — or "none">`

## 9. Outcome mapping

How this sector's results map to our `outcome` values
(`confirmed`, `rescheduled`, `callback_requested`, `not_interested`,
`do_not_call`, `wrong_person`, `incomplete`, `other`):

| Real-world result | `outcome` |
|-------------------|-----------|
| `<e.g. patient confirmed>` | `confirmed` |

## 10. Lessons learned

Append after every client. This is the most valuable section over time.

- `<date>` — `<what surprised us>`

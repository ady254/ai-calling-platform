# Sector Pack — Healthcare (Appointment Reminders)

**Status:** draft — validate with the first live client
**Business.industry value:** `Healthcare`

---

## 1. The job

Remind patients of an upcoming appointment, confirm attendance, and reschedule
if they can't make it.

## 2. Primary KPI

**No-show rate.** Not calls made. A clinic feels a no-show as a wasted slot and
lost revenue; that's the number to report every week.

| Metric | Baseline (before us) | Target |
|--------|----------------------|--------|
| No-show rate | Ask at kickoff — typically 15–30% | −30% relative |
| Reschedules captured | 0 (they just don't show) | Every "can't make it" becomes a new slot |

> A recovered no-show is worth one appointment's revenue. That number is the
> whole ROI case — get it at kickoff.

## 3. Compliance requirements 🔴

- **Consent basis:** existing patient relationship with a **scheduled
  appointment**. This is the lowest-risk calling there is — we're not selling,
  we're reminding someone of something they booked.
- **Sector regulation:** **HIPAA** + TCPA
- **Blocking prerequisite:** **SIGNED BAA BEFORE ANY PATIENT DATA MOVES.**
  No BAA → no CSV, no calls, no deal. This is not negotiable and not a
  paperwork formality.
- **Risk level:** **high** (patient data), though the *calling* itself is low-risk
- **Notes:**
  - Minimise PHI. The AI needs `name`, `appointment_date`, `doctor_name`. It does
    **not** need diagnosis, medication, or reason for visit — don't accept those
    columns even if offered.
  - Never state a medical reason for the appointment out loud — someone else may
    answer the phone.
  - Transcripts are stored **unencrypted** today (see the audit). Say so plainly
    before signing anything.

## 4. Prompt template

```
You are calling on behalf of {{business_name}}.

Open by identifying yourself as an automated assistant calling about an
appointment. (Required disclosure — do not remove.)

Goal: confirm the patient is coming to their appointment, or reschedule it.

Personalisation from CSV columns:
  {{name}}, {{doctor_name}}, {{appointment_date}}, {{department}}

Rules:
- Keep the opening under 10 seconds. Get to the point: who you are, why you're
  calling, when the appointment is.
- Confirm you're speaking to {{name}} before giving any appointment details —
  someone else may answer the phone.
- NEVER state the medical reason for the appointment.
- If they can't make it, offer to reschedule and capture the preferred time.
- If they ask not to be contacted again, confirm politely and end the call.
- If asked anything clinical, do not answer — offer to have the clinic call back.
```

## 5. Knowledge base starter

1. *"Can I reschedule?"* → Yes — capture preferred day/time, mark `rescheduled`.
2. *"Where is the clinic?"* → Address + parking.
3. *"What do I need to bring?"* → ID, insurance card, referral if applicable.
4. *"Do I need to fast / prepare?"* → **Escalate.** Clinical — do not guess.
5. *"Can I cancel?"* → Confirm, note the cancellation policy.
6. *"Is my insurance accepted?"* → From client's list, else escalate.
7. *"Who is Dr. {{doctor_name}}?"* → Department/speciality only.

> Items 4 and 6 are where a wrong answer becomes a real problem. Escalate.

## 6. Top objections

| Objection | Response that works |
|-----------|---------------------|
| "I didn't book this" | Confirm identity; if wrong person → `wrong_person`, stop. |
| "I'm too busy" | Offer to reschedule rather than push attendance. |
| "Why are you calling me?" | Reminder only. Never volunteer clinical detail. |
| "Are you a robot?" | Yes — confirm honestly, offer a human callback. |

## 7. Defaults

| Setting | Value | Why |
|---------|-------|-----|
| Calling hours | 9:00–18:00 local | TCPA is 8am–9pm; clinics prefer business hours |
| Best window | **16:00–18:00** | Highest answer rate observed in our data |
| Voice / tone | Calm, precise, unhurried | Patients may be elderly or anxious |
| Language | `en-US` (confirm — set `Business.default_language`) | Many clinics need a second language |
| Retries | 2, ≥4h apart | Never call twice in one hour |

## 8. Data source & integration

- **Where their contacts live:** EHR / scheduling system (Epic, Cerner, athena)
- **Extra CSV columns to request:** `doctor_name`, `appointment_date`,
  `department` — each becomes a `{{variable}}` in the prompt
- **Do NOT request:** diagnosis, medication, visit reason, MRN
- **Integration needed:** ideally calendar write-back for reschedules. Until
  built, reschedules land in `follow_up` and the clinic actions them manually —
  **tell them this**, it's a real manual step for their staff.

## 9. Outcome mapping

| Real-world result | `outcome` |
|-------------------|-----------|
| Patient confirmed they're coming | `confirmed` |
| Wants a different date/time | `rescheduled` |
| Asked to be called back later | `callback_requested` |
| Cancelling, not rebooking | `not_interested` |
| "Stop calling me" | `do_not_call` |
| Wrong number / patient unavailable | `wrong_person` |
| Hung up before purpose addressed | `incomplete` |

## 10. Lessons learned

- _(append after the first client)_

# ANUPALAN: 9-Step Demo Script (Definition of Done)

**Total live rehearsal time:** 6 to 7 minutes.  
**Video cut (3 to 4 minutes):** Steps 2, 5, 6, 7, 9.  
**Automated verification:** Every step is also an automated Playwright e2e test in `e2e/`. If any step fails, the build is RED.

---

## Pre-flight Checklist (15 minutes prior)
- [ ] `pnpm db:reset` executed cleanly, seeding fixtures: `DEMO-001`, `DEMO-LEASE`, `DEMO-UNDERTAKING`, and ~400 synthetic cases.
- [ ] Time Machine offset is 0 days. Virtual clock banner is hidden or indicates normal time.
- [ ] MailHog web dashboard open in a browser tab (`http://localhost:8025`).
- [ ] Browser tabs pre-authenticated across distinct roles:
  - Tab 1: **System Admin** (`admin@aicte.gov.in`)
  - Tab 2: **Institution User** (`principal@demo-engg.edu.in`)
  - Tab 3: **Scrutiny Officer** (`scrutiny.west@aicte.gov.in`)
  - Tab 4: **Regional Director** (`rd.west@aicte.gov.in`)
  - Tab 5: **Competent Authority / HQ** (`chairman@aicte.gov.in`)
- [ ] Screen recording configured at 1080p, 110% zoom, notifications muted.
- [ ] Local Docker container stack verified (`docker compose ps`).

---

## The 9 Demo Steps

| # | Duration | Actor / Role | Action to Perform | Required Observable Output |
|---|---|---|---|---|
| **1** | 0:45 | **Admin** | Open Rule Packs. Inspect `New institution` mapping to `Scrutiny ➔ EVC ➔ Regional Committee ➔ Decision`. Edit EVC SLA from 30 to 25 days. Click **Impact Preview**, review affected cases, and publish with version note `"Updated EVC SLA per Council notification"`. | Impact preview modal displays list of open cases whose due dates will shift; `RULEPACK_PUBLISHED` written to audit log; new SLA active immediately. |
| **2** | 0:45 | **Institution & Officer** | As Institution, submit a *New Course* application (`scrutiny_evc` pathway) and an *Existing Extension* application (`only_scrutiny` pathway). Switch to Officer and attempt an unauthorized stage skip (directly from Scrutiny to Decision on the New Course). | Applications cleanly route to separate configured pathways and region queues; illegal stage skip is blocked with error message; `BLOCKED_TRANSITION` audit entry recorded. |
| **3** | 0:45 | **Scrutiny Officer** | Open case `DEMO-001` in Scrutiny queue. Click **Return to Institution** with an empty reason (refused by validation). Enter valid reason: *"Deficient faculty cadre ratio in Computer Science Dept"*. | Validation error blocks empty reason; valid submission pauses AICTE clock and starts Institution response clock; human badge displays officer name and timestamp. |
| **4** | 0:45 | **Institution & Officer** | Switch to Institution: review return reason in Compliance Passport, upload updated faculty affidavit, and click **Resubmit**. Switch back to Officer: mark Re-Scrutiny complete. | Institution clock stops; AICTE clock resumes with *remaining* SLA days (not a reset count); case auto-advances to EVC scheduling queue with human badge. |
| **5** | 1:15 | **Admin & Regional Director** | In Admin settings, open Time Machine and advance virtual clock by **+20 days**. Switch to Regional Director view. Inspect overdue case alert and click **"Why this alert?"**. | Alert notifications trigger sequentially: Reminder (`T-3`), Overdue (`T-0`), and Escalation (`T+3` to RD); alert badge turns red; email arrives in MailHog; Follow-ups-saved counter increments; 3-click drilldown (All-India ➔ Region ➔ Officer ➔ Case) works seamlessly. |
| **6** | 1:30 | **Regional Director & HQ** | RD schedules EVC and uploads visit report. Switch to HQ / Competent Authority: open case and click **Decide**. Examine the Readiness Gate evaluation. Acknowledge advisory flags with reason, and grant **Conditional Approval**. | Readiness Gate displays AMBER/RED status citing open/expiring conditions; Decision Brief freezes and stores PDF hash in audit log; 6-month deficiency obligation and undertaking are spawned into the Obligation Ledger. |
| **7** | 1:00 | **System, Institution & Officer** | Open fixture `DEMO-LEASE` (`valid_to = today + 30 days`). Observe `T-30` advance expiry alert. As Institution, upload lease renewal document. As Officer, confirm new `valid_to` date and verify. | Renewal recorded as a new version; expiry alerts automatically resolve and close; Compliance Index recalculates upward with itemized breakdown. |
| **8** | 0:45 | **Admin & HQ** | Fast-forward Time Machine past the due date of fixture `DEMO-UNDERTAKING`. Open Obligation Tracker. | Escalation ladder visual demonstrates sequential escalation (Owner ➔ RD ➔ HQ) with timestamped dispatches; risk-ordered verification queue re-prioritizes; Compliance Index drops with exact deduction breakdown. |
| **9** | 1:00 | **HQ / Auditor** | Open the Case Audit Trail. Click **Verify Integrity** (indicator displays green checkmark). In backend database, execute `scripts/tamper.sql` to tamper with one historical row. Click **Verify Integrity** again. | Audit log exhibits complete immutable history (actor, role, timestamp, reason); initial integrity check passes; after tampering, verification immediately turns red pointing to the exact compromised row ID; daily Ed25519 digital seal shown. |

---

## Closing Line
> *"The system routed, timed, and escalated. Every decision on this screen has a human name next to it."*

---

## SIH Scoring Map

| Evaluation Criterion | Addressed in Steps | Demonstration Focus |
|---|---|---|
| **Workflow Accuracy & Configurability** | 1, 2 | Versioned YAML rule packs; dynamic routing; blocked illegal transitions |
| **Timeliness of Alerts & Escalation** | 5, 8 | Multi-tier escalation ladder; idempotent alerting; time machine simulation |
| **Reliability of Deadline Tracking** | 3, 4 | Dual-clock attribution; pause on return; working-day calendar logic |
| **Visibility of Pending Cases** | 5 | 3-click hierarchical drilldown (National ➔ Region ➔ Officer ➔ Application) |
| **Reduction in Manual Follow-up** | 5 | Live metrics counter measuring automated alerts vs manual follow-ups |
| **Completeness of Audit Trail** | 9 | Cryptographic SHA-256 hash chaining; external Ed25519 seals; tamper detection |
| **Regulatory Safeguards & Human Agency** | 3, 6 | Named human badges; mandatory justifications; Readiness Gate with override logging |

---

## Script Vocabulary: Say vs Do Not Say

- **Say**: *"Open obligations are surfaced to the official at decision time, with all overrides recorded."*
- **Say**: *"Tampering is mathematically detectable, even by a database administrator, because seals live outside the database."*
- **Say**: *"SLA values are illustrative defaults until configured from the active APH; changing them is a single screen, not a code deployment."*
- **Do Not Say**: *"First in India or the world"*, *"Completely tamper-proof"*, *"Eliminates all bureaucratic delay"*, *"Fully automated approval engine"*.
- **Always State What Is Mocked**: National Single Window System (NSWS) intake adapter, AICTE portal CSV/JSON import, SMS gateway, DigiLocker verification stub.

---

## Live Contingency Procedures
1. **Time Machine Desynchronization**: Click **Demo Reset** button on the admin toolbar to restore seed fixtures and reset offset to 0.
2. **Email Delivery Delay**: Open MailHog tab (`localhost:8025`) directly to demonstrate instant SMTP dispatch.
3. **Local Docker / Venue Network Failure**: Fall back immediately to local pre-recorded walkthrough video and narrate live.

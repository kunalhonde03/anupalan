# ANUPALAN — The Obligation-Aware AICTE Approval & Compliance Platform

> **SIH 2026 · PS 26262 · Research, Concept & Build Documentation**

---

## 0. How to Read This Document

### Evidence Tags
- **`[V]` Verified**: Observed in an authentic public AICTE or Government document during research (EoA letters, circulars, APH chapters, SAC/SHC reports).
- **`[I]` Inferred**: A reasonable engineering or operational inference from official evidence, not yet confirmed directly with AICTE officials.
- **`[P]` Placeholder**: An operational parameter, numeric SLA, or specific rule that must be validated against the active Approval Process Handbook (APH) before being cited as fact.

---

## 1. Executive Summary

### The Core Premise
An AICTE approval is not the end of a case — it is the start of a binding set of promises **`[V]`**. 
- The Extension of Approval (EoA) letter mandates an institution to rectify self-disclosed deficiencies within six months of issuance.
- Standing Hearing Committees (SHC) and Standing Appellate Committees (SAC) routinely grant approval "with undertaking" (e.g., faculty recruitment within specified deadlines).
- Course closure applications frequently stall in *Pending* status awaiting mandatory University or State Government No-Objection Certificates (NOCs).
- Land lease agreements must maintain sufficient unexpired validity proportional to the longest course duration.

Today, these obligations remain stranded as unstructured text inside static PDF letters. No automated system tracks their lifecycle, alerts officers to impending breaches, or surfaces unmet obligations when the institution applies for its next approval or intake increase.

**ANUPALAN** closes this regulatory loop. It orchestrates every application through a configurable **Pathway Engine**, monitors processing velocity using a **Dual-Clock SLA Engine** (differentiating AICTE processing time from institutional delay), manages every compliance condition inside an **Obligation Ledger**, and enforces statutory vigilance via an advisory **Readiness Gate** at the precise moment of decision. 

> **One-Line Pitch:**  
> *"Every approval creates promises. ANUPALAN ensures someone is watching them — and that the next decision-maker sees them."*

---

## 2. Project Scope & Boundary

| Build for Real (Core Prototype) | Mock Behind an Adapter | Strictly Out of Scope / Do Not Build |
|---|---|---|
| **Pathway Engine** with versioned YAML rule packs | **AICTE Web Portal Import** (CSV / JSON fixture ingestion) | **ML Pendency Prediction** (opaque, unsafe for statutory review) |
| **Dual-Clock SLA Engine** with pause/resume intervals & escalation ladder | **NSWS Intake Channel** (sample JSON payload adapter) | **Blockchain / Distributed Ledger** (unnecessary complexity; hash chain suffices) |
| **Time Machine** virtual clock fast-forward | **SMS & WhatsApp Gateway** (mock console & event log) | **Conversational Chatbot** |
| **Obligation Ledger** with evidence upload & officer verification | **DigiLocker Interface** (mock signed verification stub) | **Mobile Application** (responsive web is sufficient) |
| **Readiness Gate** & frozen Decision Brief PDF generation | **Email Dispatch** (Nodemailer → MailHog in dev, SMTP in demo) | **Auto-Approval / Auto-Rejection** (strictly prohibited) |
| **Role-Based Dashboards** with 3-click drilldown (All-India → Region → Officer → Case) | | **Unsubstantiated Live AICTE API Claims** |
| **Hash-Chained & Cryptographically Sealed Audit Trail** (`Ed25519`) | | |

---

## 3. Grounded AICTE Research Findings

Our architecture is directly derived from AICTE's published regulatory artifacts:

1. **6-Month Deficiency Window `[V]`**: EoA letters mandate compliance for deficiencies (faculty Cadre ratio, laboratories, library volumes/titles, barrier-free access) within 6 months of issue date.
2. **Mandatory APH Chapter VI Essential Norms `[V]`**: EoA reports explicitly bind institutions to essential requirements.
3. **Approvals with Undertaking `[V]`**: SAC/SHC reports (e.g., April 2026 proceedings) document approvals conditional upon legally binding undertakings.
4. **Multi-Stage Processing `[V]`**: SAC/SHC proceedings reference Scrutiny, Re-Scrutiny, Expert Visit Committee (EVC), and Regional Committee stages.
5. **Versioned Approvals & Corrigenda `[V]`**: Approvals are amended via official Corrigenda mid-cycle (e.g., Corrigendum-1 issued post-EoA).
6. **Carry-Forward Directives `[V]`**: Approvals note whether subsequent years will strictly enforce norms rather than accepting "as is where is" conditions.
7. **NOC Dependencies `[V]`**: Institutional transitions regularly bottleneck on State and Affiliating University NOCs.
8. **Extended 3-Year EoA `[V]`**: Eligible institutions receive 3-year approvals with mandatory annual reporting, shifting regulatory workload from annual scrutiny to continuous obligation monitoring.
9. **Lease Validity Norm `[V / P]`**: Live lease duration must meet or exceed the longest course duration, with 30-year extension rules applying once threshold margins are approached.
10. **Mid-Cycle Policy Shift `[V]`**: Council Corrigendum dated 2 Dec 2025 reconstituted EVC constitution authority from Regional Officers to the Council, underscoring the absolute necessity of versioned, configurable rule packs.

---

## 4. System Architecture & The 8 Pillars

```
Application ──▶ Pathway Engine ──▶ HUMAN DECISION ──▶ Obligations Born
      ▲        (Rule Pack YAML)          ▲                     │
      │                                  │                     ▼
      │                            Readiness Gate ◀──── Verification ◀──── Evidence Upload
      │                           (Advisory Checks)            ▲
      └────── Next Application / Intake Request ───────────────┘

Dual-Clock SLA Engine: Watches all states (Remind ➔ Overdue ➔ Escalate)
Cryptographic Audit Log: Append-only, hash-chained SHA-256 with external daily Ed25519 seals
```

### The 8 Pillars

1. **Pathway Engine & Rule Packs**: Application types map to ordered stage sequences defined purely in data (`rules/aph-2024-27.yaml`). Applications remain pinned to their submission rule pack version.
2. **Dual-Clock SLA Engine**: Attributed time measurement distinguishing AICTE processing time from Institutional response time via concrete time intervals (`AICTE` vs `INSTITUTION`). Supports calendar and working-day arithmetic skipping gazetted holidays and weekends.
3. **Obligation Ledger**: A unified data model tracking deficiencies, undertakings, NOCs, carry-forward caveats, lease validity, and statutory certificates with due dates, evidence versions, and review states.
4. **Readiness Gate & Decision Brief**: Comprehensive pre-decision analysis assessing open obligations, lease margins, expiring documents, and repeat deficiencies. Freezes an unalterable single-page Decision Brief PDF with cryptographic hash on decision.
5. **Cryptographically Sealed Audit Trail**: Every mutation writes to an append-only, SHA-256 hash-chained log within the same database transaction using PostgreSQL advisory locks. Daily external digital seals (`Ed25519`) verify chain integrity and detect tampering.
6. **Compliance Index & Risk-Ordered Verification Queue**: Transparent 0–100 institutional health score calculated with clear deduction items, driving a prioritized queue for regional verification officers.
7. **Time Machine & Rule Impact Simulator**: Virtual clock manipulation for testing multi-week escalation cascades in seconds, paired with a dry-run rule pack simulator that projects due-date shifts across open cases before publishing.
8. **Role-Tailored Dashboards & Compliance Passport**: Dedicated views for Institutions (Compliance Passport), Scrutiny Officers, Regional Directors, Committee Members, and Headquarters, featuring 3-click drilldown and bottleneck analysis.

---

## 5. Novelty Claims & Defensible Vocabulary

| Feature | Defensible Statement (Say This) | Inaccurate Claim (Do Not Say) |
|---|---|---|
| **Readiness Gate** | *"Open obligations and compliance risks are systematically surfaced to the official at decision time, with all overrides recorded."* | *"World's first AI autonomous approval engine."* |
| **Dual Clock** | *"Delay is attributed accurately to AICTE processing or institutional responsiveness per stage, making accountability measurable."* | *"Eliminates all processing delays."* |
| **Rule Packs** | *"APH regulatory shifts are treated as versioned configuration with impact preview, eliminating code rewrites during mid-cycle amendments."* | *"Auto-crawls and updates from government gazettes."* |
| **Sealed Audit** | *"Tampering is mathematically detectable, even by a database administrator, because verification keys and seals live outside the database."* | *"Completely tamper-proof unhackable system."* |
| **Compliance Index** | *"A transparent prioritisation aid that guides officer attention toward high-risk institutions without automatic punitive action."* | *"Automated algorithmic penalty scoring."* |

---

## 6. Hard Regulatory Safeguards

- **Human-in-the-Loop Invariant**: No status change to `APPROVED`, `REJECTED`, `RETURNED`, or `STAGE_COMPLETE` may be initiated by the system or scheduler. Only an authenticated human user holding the permitted role can execute transitions.
- **Explainable Rules**: Core business logic is strictly deterministic and rules-based. Any future AI assistance is confined to non-binding draft suggestions with explicit human confirmation badges.
- **Mandatory Justification**: Reverts, returns, and decision overrides over `RED` Readiness Gate flags strictly require structured, non-empty justifications logged to the audit chain.
- **Zero-Bypass Scoping**: Multi-tenant regional security guarantees that Regional Officers and Institutions can only query entities within their authorized administrative scope.

# Commercial & GA Readiness Checklist

This checklist documents the legal, regulatory, and support frameworks established to support CareerPropel's commercial launch and public user onboarding.

---

## 1. Legal & Regulatory Compliance

To protect candidate profiles and comply with international regulations (GDPR, CCPA), we have structured core agreements and consent templates:

### Compliance Matrix

- [x] **Terms of Service (ToS)**
  *   **Scope**: Outlines acceptable usage limits, ownership of tailored resumes (vested 100% in the user), and limitations of liability regarding automated application outcomes.
  *   **Maturity**: Drafted and approved by legal counsel.
- [x] **GDPR / CCPA Privacy Policy**
  *   **Scope**: Details exact data collection paths. Explains how resume data, job inputs, and transcript files are parsed, stored, and utilized.
  *   **Key Provision**: AI models do not use user data for global model training. All model calls utilize zero-data-retention APIs.
- [x] **User Consent & Cookie Disclosures**
  *   **Scope**: Dynamic banner prompts for cookie selection and explicit "opt-in" consents before processing any sensitive PII data (e.g., phone numbers, home addresses on resumes).

---

## 2. Data Governance & Sovereignty

Candidates maintain total control over their data, aligning with our zero-retention architectural commitment.

```
       [Candidate Data]
              │
      ┌───────┴───────┐
      ▼               ▼
[Standard Tier]   [Zero-Retention Tier]
(Encrypted db)    (In-memory only; 
                   purged post-session)
```

### Key Data Safeguards & Self-Serve Verification

*   **Zero-Retention Privacy Mode**: Candidates can opt into a maximum-privacy tier where no records are written to disk. The processing is handled in-memory and immediately purged at session termination.
*   **Self-Serve Data Export**: Candidates can export all stored data (profile info, job applications, interview transcripts, and metrics) in structured JSON format via the profile settings panel (`GET /api/profile/export`).
*   **Self-Serve Data Deletion**: Candidates can initiate total deletion (`POST /api/profile/delete`). This executes a cascading database query that wipes all database rows (Candidate, Job, Interview, and Appraisal records) and invalidates active session tokens.

To programmatically confirm that deletion and export features execute without database failures or orphaned records, run:
```bash
npx tsx src/evaluation/verify-compliance.ts
```

---

## 3. Incident Communication & Escalation

In the event of a service outage or operational disruption, we have established clear communication protocols:

### Service Interruptions Workflow

```
[System Outage] ──> Status Page Updated ──> Internal Slack Alert ──> Core Ops Triage
                                                                           │
                                                                           v
[Resolution] <── User Status Mailer <── Diagnostic Update <── Incident Assigned
```

### Operational Tier Levels

| Severity Tier | Definition | Response Target | Comm Channel |
| :--- | :--- | :--- | :--- |
| **Severity 1** (Critical) | Primary database cluster offline; full system outage; core auth failed. | **< 15 minutes** | Status Page, bulk email alerts, active banners in app. |
| **Severity 2** (High) | LLM provider failures (throttling/outage); PDF parsing queues backlogged. | **< 60 minutes** | Inline dashboard notices, direct notifications. |
| **Severity 3** (Standard) | Individual campaign failures; cosmetic UI bugs. | **< 24 hours** | Support portal updates. |

---

## 4. Support & Feedback Pipeline

*   **Customer Support Portal**: A ticketed queue system (`support@careerpropel.io`) integrated directly into the workspace admin dashboard.
*   **Operator Escalation Paths**: Standard support queries are triaged and routed. High-severity technical failures (e.g. database deadlocks, connection pools exhausted) immediately trigger SMS paging alerts via OpsGenie to the on-call engineer.
*   **User Feedback Loops**: Post-interview and post-appraisal review prompts collect quality score surveys to continuously evaluate the system's performance.

---

> [!IMPORTANT]
> The legal, data governance, and escalation systems have been fully implemented and verified. CareerPropel is commercially ready for secure public deployment.

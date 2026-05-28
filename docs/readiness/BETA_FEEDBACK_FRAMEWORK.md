# Controlled Beta Feedback & Testing Framework

This framework defines the methodology, survey schemas, and incident tracking procedures to govern CareerPropel's Controlled Beta cohort (5, 10, and 20 users).

---

## 1. Beta Cohort Progression Map

Our testing program is divided into three sequential feedback windows:

```
[Cohort Alpha: 5 Users] ──> [Cohort Beta: 10 Users] ──> [Cohort Gamma: 20 Users]
    * Install & Path            * Feature Workflows           * Outbound Outreach
    * Consent & Profile         * ATS Matches & Gaps          * Full Progression
```

---

## 2. Structured Feedback Survey Questionnaires

Candidates are surveyed post-onboarding and after completing major features. Ratings utilize a 1-to-5 Likert scale.

### A. Onboarding & Preset Tailoring
1. *How easy was it to understand the distinction between Local Privacy and Managed Compute tiers?*
2. *Did the pre-scaffolded AI provider configurations align with your initial tier expectations?*

### B. ATS Scoring & Fit Accuracy
1. *How helpful was the keyword overlap matrix in identifying profile gaps?*
2. *Did the deconstruction analysis align with your actual career level and seniority?*

### C. Mock Interview Simulator
1. *Rate the response latency of the conversational feedback.*
2. *Did the questions generated effectively target your active skill gaps?*

---

## 3. Session Recording & Privacy-First Policy

To maintain compliance and respect user data sovereignty, session recording follows strict privacy boundaries:

*   **Opt-In Verification**: No tracking or logging is initiated unless the candidate provides explicit, separate consent during onboarding.
*   **PII Sanitization**: All contact details, resumes, passwords, and API keys are scrubbed client-side before any session recording payloads are transmitted.
*   **Zero-Retention Overrides**: If a user selects "Local" or "Zero-Retention" privacy modes, session recording is completely deactivated at the hardware level.

---

## 4. Feedback Collection Schema (JSON)

Every beta feedback submission is logged in a structured format:

```json
{
  "feedbackId": "fb_908f-2a3c",
  "email": "candidate@example.com",
  "cohort": "alpha",
  "ratings": {
    "onboarding": 5,
    "extraction": 4,
    "atsMatch": 5,
    "interviewPrep": 4,
    "appraisal": 4,
    "networking": 3
  },
  "freeText": {
    "strengths": "ATS matching keyword deconstruction was highly detailed.",
    "frictionPoints": "Outreach recruiter discovery spider spent too long searching generic job titles.",
    "suggestedImprovements": "Integrate direct email synchronization."
  },
  "sessionRef": "sess_892b-8a21",
  "submittedAt": "2026-05-29T04:12:00Z"
}
```

---

## 5. Issue & Bug Categorization

Discovered errors are logged in the repository issue tracker categorized by functional domain and severity:

| Severity Level | Definition | Response Target | Example |
| :--- | :--- | :--- | :--- |
| **Severity 1** (Blocker) | Critical crash; auth loop; cascade deletion failure. | **Immediate (< 2h)** | Cascade delete doesn't wipe all linked rows. |
| **Severity 2** (Major) | PDF columns interlacing; deep-crawl timeout; 2FA clock drifts. | **Next release (< 12h)** | Double-column PDF text lines displaced horizontally. |
| **Severity 3** (Minor) | Markdown rendering format overflows; minor labeling typos. | **Standard sprint (< 48h)** | bullet lists overlapping margins on PDF export. |

---

> [!TIP]
> Collecting structured qualitative surveys and categorizing bugs by severe thresholds guarantees a transparent, reliable, and user-centric Controlled GA launch.

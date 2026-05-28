# Product Success Metrics & KPIs

This document establishes the product effectiveness indicators, user progression funnels, and target success boundaries that serve as our North Star during the Controlled GA phase.

---

## 1. Funnel Performance Targets

Unlike infrastructure metrics (CPU, RAM, queue latency), product metrics evaluate **relevance**, **user retention**, and **value extraction**.

```
[Resume Uploaded] ──> [Profile Created] ──> [Match Generated] ──> [Interview Session]
     Target: 95%           Target: 90%           Target: 85%           Target: 80%
```

### Conversion & Efficacy Thresholds

| Metric / KPI Area | Target Value | Measured Method | Product Value Justification |
| :--- | :---: | :--- | :--- |
| **Profile Completion Rate** | **≥ 85.0%** | Candidates who complete onboarding and extract baseline skills. | Ensures users populate high-quality match seeds. |
| **ATS Match Generation Efficacy** | **≥ 90.0%** | Candidates running at least 3 job match calibrations. | Demonstrates engagement with our core deconstruction engine. |
| **Mock Interview Completion** | **≥ 80.0%** | Candidates answering all generated technical questions in a session. | Validates conversational responsiveness and usability. |
| **Appraisal Review Adoption** | **≥ 75.0%** | Generated accomplishments exported to documents. | Proves narrative alignment saves meaningful writing time. |
| **Outreach Response Ratio** | **≥ 20.0%** | Recruiter responses logged in outbound campaigns. | Core metric proving discoverability and Outreach quality. |

---

## 2. Telemetry Verification Boundaries

To guarantee system stability and provider failover integrity, operational metrics are governed by these maximum ceiling targets:

### Fallback & Failover Ceilings

*   **Provider Fallback Degraded Rate**: **≤ 5.0%**. Triggering secondary models (e.g. Groq/Ollama) due to Primary provider (Anthropic/Gemini) rate limits or outages must stay below this ceiling.
*   **AI Session Failure Rate**: **≤ 1.0%**. Catastrophic extraction or deconstruction failures must be caught cleanly by Layer 3 schema verification.
*   **User Abandonment Rate**: **≤ 15.0%**. Tracked across all routes: candidates opening the upload or matching panels but leaving before completion.

---

## 3. Metric Aggregation Architecture

Product KPIs are computed directly from the persistent `ProductFunnelMetric` PostgreSQL database records using structured Prisma aggregation queries:

```typescript
// Example: Computing Profile Completion Efficacy
const onboardingStarted = await prisma.productFunnelMetric.count({
  where: { funnel: 'resume', step: 'profile', status: 'started' }
});
const onboardingCompleted = await prisma.productFunnelMetric.count({
  where: { funnel: 'resume', step: 'profile', status: 'completed' }
});

const onboardingEfficacy = onboardingStarted > 0 ? (onboardingCompleted / onboardingStarted) * 100 : 0;
```

---

> [!TIP]
> Tracking actual conversion ratios against these success metrics ensures that the platform delivers genuine career acceleration utility to our candidates.

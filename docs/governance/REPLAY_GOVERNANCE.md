# Replay Governance & Safety Policies

This document describes the validation rules, authentication requirements, and rate limiting policies governing manual and automated execution replays in CareerPropel.

## 1. Replay Safety Assessment Criteria

Before any job is resubmitted to active queues, the system enforces safety evaluations (`src/lib/observability/replay.ts`):

*   **Status Bounds Check**: The target job must be in a terminal state (`failed` or `completed`). Active or queued jobs cannot be replayed.
*   **Duplicate Risk Detection**: Prior replays are queried from the durable ledger. If the task has already been replayed, the eligibility shifts to `conditional` (requiring manual operator override).
*   **Side-Effect Isolation**: Task types performing external integrations (`follow-up`, `networking`, `application`) are marked as high-risk and restricted from automated replay paths.

---

## 2. Security & Rate Limiting

The DLQ manual replay REST endpoints are protected against replay storms, abuse, and credential leaks:

*   **Operator Authentication**: Replay trigger requests require authorization headers, validated against API keys or sessions.
*   **Redis-Backed Token Bucket Rate Limiting**: The endpoint `/api/ops/dlq/replay` implements a Token Bucket algorithm:
    *   **Capacity**: 10 tokens.
    *   **Refill Rate**: 1 token every 2 minutes.
    *   Exceeding requests are rejected immediately with `429 Too Many Requests`.
*   **Immutable Ledger Auditing**: Every replay attempt writes a structured event log to the append-only ledger (`execution:replay` event), capturing operator ID, client IP, timestamp, and justification.

# Glossary

## Purpose

Definitions for domain terms used across CareerPropel documentation.

---

## A

**Agent / AI Agent**
An automated workflow that calls an LLM (Claude) to perform a specific career task. Identified by `agentType`. See [Agent Types](../concepts/agent-types.md).

**AgentExecution**
The Prisma model representing a single end-to-end agent run. Contains status, input, output, token counts, governance provenance, and timestamps.

**AgentPolicy**
Per-agent-type governance configuration: token limits, cost caps, allowed tools, concurrency limits, PII handling mode. Defined in `policyEngine.ts`.

---

## B

**BullMQ**
The job queue library used for reliable, retryable agent execution. Backed by Redis. See [Queue Infrastructure](../components/queue-infrastructure.md).

**Bounded Execution**
Execution context that enforces TTL, depth limits, and token budgets to prevent runaway or recursive agent calls. See `boundedExecution.ts`.

---

## C

**Canary Routing**
Traffic-split mechanism in the prompt registry. A canary `PromptVersion` with `canaryPercent: 10` receives 10% of executions for that agent type.

**Circuit Breaker**
Per-provider failure detection. When consecutive failures exceed `providerCircuitBreakerThreshold`, the circuit "opens" and rejects calls. See `providerQualification.ts`.

**Concurrency Slot**
Redis-backed lock that limits how many agent executions a user can run simultaneously. Controlled by `USER_CONCURRENCY_LIMIT`.

**correlationId**
A UUID propagated through the full execution chain (API → queue → worker → events) for distributed tracing. Included in all log events.

---

## D

**Dead-Letter Queue (DLQ)**
BullMQ queue (`agent-execution-dlq`) that receives jobs after all retry attempts are exhausted. Jobs can be replayed via `POST /api/ops/dlq/replay`.

**Degradation Score**
0–100 score for a provider: 0–20 healthy, 21–50 warning, 51–80 degraded, 81–100 critical. Derived from failure rate, timeout rate, fallback rate, and p95 latency.

---

## E

**EventLog**
Structured log entry tied to an `AgentExecution`. Levels: `INFO`, `WARN`, `ERROR`, `DEBUG`. Persisted to PostgreSQL.

**ExecutionBoundary**
In-memory struct tracking TTL, depth, token budget, and ancestor IDs for a bounded execution context.

---

## G

**Governance Layer**
The mandatory pipeline of controls applied to every agent execution: policy check → prompt version resolution → output validation → hallucination inspection. See [Governance Layer](../components/governance.md).

---

## H

**Hallucination Detection**
Pattern-based inspection of LLM output for fabricated content, prompt injection, PII exposure, and manipulative language. See `hallucinationControls.ts`.

---

## L

**Lock Duration**
BullMQ worker setting (`lockDuration`) equal to `executionTimeoutMs`. If the worker fails to renew the lock within this window, BullMQ considers the job stalled.

---

## P

**p95 Latency**
The 95th percentile latency across recent executions. Used in provider health scoring and metrics snapshots.

**Policy Check**
Pre-execution gate that verifies the request complies with `AgentPolicy` limits (tokens, cost, concurrency, tools).

**PromptVersion**
DB record containing a versioned prompt (system + user template), content hashes, lifecycle state, and canary routing config.

**promptVersionId**
FK stored on `AgentExecution` linking it to the exact `PromptVersion` used. Enables governance audit trails.

---

## R

**requestId**
UUID assigned at API intake. Included in logs and DB records for request tracing. Distinct from `correlationId` (which spans the queue).

**Retry Policy**
BullMQ configuration: up to `QUEUE_ATTEMPTS` retries with exponential backoff starting at `QUEUE_BACKOFF_MS`.

---

## S

**SSE (Server-Sent Events)**
HTTP transport used for real-time execution streaming. One-directional (server → client). Clients use `EventSource` API. Canonical real-time channel since commit `8754c84`.

**Semantic Validation**
Second layer of output validation. Applies plausibility heuristics (e.g., "confidence score cannot be 100") beyond what Zod schema checks.

---

## T

**ToolCall**
DB record for each tool invoked by an agent during execution. Tracks input, output, duration, and status.

**TTL (Time-To-Live)**
Maximum wall-clock duration for an agent execution. Default: 900 seconds (15 minutes). Enforced at both BullMQ lock level and `TtlExpiredError` in `boundedExecution.ts`.

---

## W

**Worker**
BullMQ `Worker` process instance that dequeues and executes agent jobs. Runs as `npm run start:worker`. Multiple workers can run in parallel for horizontal scaling.

---

## Last Updated
2026-05-27

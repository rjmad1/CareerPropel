# Domain Glossary

Definitions of core domain concepts and terminology used within the CareerPropel codebase and documentation.

---

## A

### Agent / AI Agent
An automated workflow that calls an LLM (Claude) to perform a specific career task. Identified by `agentType` (e.g., `resume-tailor`, `job-match`).

### AgentExecution
The Prisma model representing a single end-to-end agent run. Contains status, input, output, token counts, governance provenance, and timestamps.

### AgentPolicy
Per-agent-type governance configuration mapping token limits, cost caps, allowed tools, concurrency limits, and PII handling modes. Defined in `policyEngine.ts`.

---

## B

### BullMQ
The Redis-backed job queue library used for reliable, concurrent, and retryable background agent execution.

### Bounded Execution
Execution context boundaries enforcing maximum time-to-live (TTL), recursion depth limits, and token budgets to prevent runaway loops. Implemented in `boundedExecution.ts`.

---

## C

### Canary Routing
Traffic-splitting mechanism in the prompt registry where a canary prompt version receives a small percentage of executions (e.g., 10% split) for verification.

### Circuit Breaker
Heuristic failure-detection per LLM provider. When consecutive failures exceed a limit, the provider circuit opens and automatically routes calls to a fallback.

### Concurrency Slot
Redis-backed locks limiting the number of parallel agent executions a single user can trigger simultaneously.

### Correlation ID
A UUID propagated through the full transaction chain (API ➔ Queue ➔ Worker ➔ EventLog) for distributed logging and tracing.

---

## D

### Dead-Letter Queue (DLQ)
The BullMQ queue (`agent-execution-dlq`) that captures failed jobs after all configured retry attempts have been exhausted.

### Degradation Score
A 0–100 health index for an LLM provider computed from timeout rates, fallback rates, and p95 latency.

---

## E

### EventLog
Structured logs generated during an `AgentExecution` (INFO, WARN, ERROR, DEBUG) and persisted directly to PostgreSQL.

### ExecutionBoundary
An in-memory boundary tracking context metadata (TTL, depth, budgets, ancestors) for a bounded execution path.

---

## G

### Governance Layer
The mandatory check pipeline wrapping all agent calls: Policy check ➔ Prompt version resolution ➔ Output validation ➔ Hallucination detection.

---

## H

### Hallucination Detection
Pattern-based validation checks on LLM outputs targeting fabricated data, prompt injections, and PII exposures.

---

## P

### Policy Check
The pre-execution validation gate verifying a request complies with cost, token, and concurrency limits before sending to an LLM provider.

### PromptVersion
A database record containing a versioned prompt layout, template variables, hashes, lifecycle states, and canary settings.

---

## S

### SSE (Server-Sent Events)
The canonical one-directional transport protocol used to stream live execution status updates from the server to client dashboards. Websockets are deprecated.

### Semantic Validation
Validation heuristics checking for logical inconsistencies in agent outputs beyond strict Zod schema shapes.

---

## T

### ToolCall
A database record tracking specific tool invocations by an agent, recording duration, input payload, output response, and status.

### TTL (Time-To-Live)
The maximum wall-clock duration allowed for a single agent execution (default 15 minutes). Enforced at the queue lock and boundary levels.

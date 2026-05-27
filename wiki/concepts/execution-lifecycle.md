# Execution Lifecycle

## Purpose

Documents every state, transition, and data mutation an `AgentExecution` record undergoes from creation to terminal state.

## State Machine

```
            ┌─────────┐
   POST /   │         │
   execute  │  queued │
   ────────►│         │
            └────┬────┘
                 │ BullMQ dequeue
            ┌────▼────┐
            │         │◄──────────────────────┐
            │ running │                        │ resume
            │         │                        │
            └────┬────┘◄───────────────────────┤
                 │                              │
        ┌────────┼────────┐              ┌──────┴───────┐
        │        │        │              │   paused     │
    success  failure  pause ─────────────►             │
        │        │        │              └──────────────┘
   ┌────▼────┐  ┌▼──────┐
   │completed│  │failed │
   └─────────┘  └───────┘
```

## State Definitions

| State | Description | Terminal? |
|---|---|---|
| `queued` | Job accepted; in BullMQ queue | No |
| `running` | Worker actively processing | No |
| `paused` | Suspended by user request | No |
| `completed` | Output produced and validated | Yes |
| `failed` | Exhausted retries or non-retryable error | Yes |

## Data Mutations by Phase

### On Creation (status=queued)

Fields set:
```
id, userId, jobId, agentType
status = 'queued'
input = JSON.stringify(sanitizedContext)
requestId, correlationId
metadata.executionModel = 'bullmq'
createdAt, updatedAt
```

### On Worker Pickup (status=running)

Fields updated:
```
queueJobId
attempts = job.attemptsMade
correlationId, requestId
```

### On Agent Execution Start

Event appended to `EventLog`:
```
level = 'INFO'
message = 'Agent execution queued: <agentType>'
```

### On Completion

Fields updated:
```
status = 'completed'
output = JSON.stringify(normalizedOutput)
tokenCount, inputTokens, outputTokens
costUsd
durationMs
completedAt

// Governance provenance
promptVersionId, promptHash
modelId, provider
fallbackUsed, fallbackReason
sanitizerVersion
validationPassed, validationErrors
validationVersion
schemaValidated, semanticValidated, policyValidated
```

### On Failure

Fields updated:
```
status = 'failed'
errorMessage = error.message
completedAt (to failure timestamp)
```

Dead-letter payload written with:
```
executionId, queueJobId, userId, agentType
failedAt, reason, attemptsMade
correlationId, requestId
```

## EventLog Entries

`EventLog` records are created throughout execution:

| Phase | Level | Message pattern |
|---|---|---|
| API intake | INFO | `Agent execution queued: <type>` |
| Worker start | INFO | `Worker picked up execution` |
| Governance violation | WARN | `Policy check failed` |
| Validation failure | WARN | `Agent output validation failed` |
| Hallucination detected | WARN | `Hallucination inspection flagged issues` |
| Completion | INFO | `Execution completed` |
| Failure | ERROR | `Execution job failed` |

## ToolCall Records

For agent types that invoke tools, a `ToolCall` record is created per tool invocation:

```
executionId (FK)
toolName
status: pending → completed | failed
input, output (JSONB)
error?
startedAt, completedAt, durationMs
tokens
```

## Realtime Events Published

| Transition | Event Type |
|---|---|
| `queued` | `execution:queued` |
| `running` | `execution:started` |
| `completed` | `execution:completed` |
| `failed` | `execution:failed` |
| log appended | `log:new` |
| tool call complete | `toolcall:complete` |

## Concurrency Lifecycle

Redis slots acquired at worker start, released in `finally`:

```
acquireExecutionSlots(userId, agentType, executionId)
  → Redis SET with NX + TTL
  → returns false if at USER_CONCURRENCY_LIMIT or AGENT_CONCURRENCY_LIMIT

releaseExecutionSlots(userId, agentType, executionId)
  → Redis DEL
  → called in finally block — guaranteed release even on error
```

## Progress Reporting

`progress` field on `AgentExecution`:

- `0` — queued
- `50` — running (coarse; actual value from `currentTask` field)
- `100` — completed

The `currentTask` string provides human-readable step descriptions for UI display.

## Related

- [Agent System](../components/agent-system.md)
- [Queue Infrastructure](../components/queue-infrastructure.md)
- [Runtime Flow](../architecture/runtime-flow.md)

## Last Updated
2026-05-27

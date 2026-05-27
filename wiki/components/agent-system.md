# Agent System

## Purpose

The agent system executes AI tasks on behalf of users. It manages execution lifecycle from API intake through BullMQ queueing, worker processing, governance gates, LLM invocation, and output persistence.

## Responsibilities

- Accept agent execution requests via REST API
- Persist execution state to PostgreSQL
- Queue jobs via BullMQ for reliable processing
- Execute AI tasks using Anthropic Claude
- Apply governance controls to every execution
- Stream real-time updates to clients via SSE
- Track tool calls and event logs per execution

## Dependencies

- `bullmq` / `ioredis` — job queue and transport
- `@anthropic-ai/sdk` — LLM provider
- `@prisma/client` — execution state persistence
- `src/lib/governance/` — policy, validation, hallucination controls
- `src/lib/queue/events.ts` — Redis pub/sub publisher
- `src/lib/realtime/` — SSE subscriber

## Public Interfaces

### POST /api/agents/execute

Enqueue a new agent execution.

**Request:**
```json
{
  "agentType": "resume-tailor",
  "context": {
    "resume": "...",
    "jobDescription": "...",
    "companyName": "...",
    "userProfile": "..."
  },
  "jobId": "optional-job-id"
}
```

**Response:**
```json
{
  "executionId": "cuid",
  "queueJobId": "bullmq-job-id",
  "status": "queued",
  "message": "Agent execution queued for processing"
}
```

**Rate limit**: 20 requests per 60 seconds per IP.

### GET /api/agent/execution/[id]

Fetch execution envelope with tool calls and logs.

**Query params:**
- `excludeTools=true` — omit tool calls
- `excludeEvents=true` — omit event logs

### GET /api/agent/execution/[id]/subscribe (SSE)

Real-time stream for execution updates. Returns `text/event-stream`.

### POST /api/agent/execution/[id]/pause
### POST /api/agent/execution/[id]/resume
### POST /api/agent/execution/[id]/cancel

Lifecycle control endpoints.

### GET /api/agent/execution/[id]/logs

Paginated event logs.

**Query params:**
- `page` (default 0)
- `pageSize` (default 50)
- `level` — filter by `INFO`, `WARN`, `ERROR`, `DEBUG`

## Agent Types

| Type | Purpose | Token Limit | Cost Limit |
|---|---|---|---|
| `resume-tailor` | Tailor resume bullets to job description | 6,000 | $0.10 |
| `job-match` | Score candidate fit against job | 5,000 | $0.08 |
| `interview-prep` | Generate full interview preparation package | 12,000 | $0.20 |
| `research` | Deep-dive company research | 10,000 | $0.15 |
| `follow-up` | Draft follow-up email sequences | 4,000 | $0.06 |
| `networking` | Outreach strategy and conversation starters | 6,000 | $0.10 |

## Execution States

```
queued → running → completed
             └──→ failed
             └──→ paused → running
```

| State | Description |
|---|---|
| `queued` | Job accepted, waiting in BullMQ |
| `running` | Worker actively executing |
| `paused` | Suspended by user request |
| `completed` | Output produced and validated |
| `failed` | Exhausted retries or non-retryable error |

## Internal Flow

```
executeAgent()
  1. getActivePromptVersion(agentType)
     → DB lookup / canary routing / auto-seed v1.0.0
  2. checkExecutionPolicy(agentType, opts)
     → abort on policy violation
  3. inspectInputForInjection(context)
     → abort on prompt injection detection
  4. Build prompt: system + user template + context
  5. Anthropic SDK call (Claude API)
  6. Parse JSON from model output
  7. validateAgentOutput(agentType, parsed)
     → schema (Zod) → semantic → policy → normalize
  8. inspectForHallucinations(agentType, output, context)
     → blockOnHallucinationRisk → abort if high severity found
  9. Update AgentExecution:
     - output, tokenCount, costUsd, durationMs
     - promptVersionId, promptHash, modelId
     - validationPassed, validationErrors
     - fallbackUsed, fallbackReason
 10. publishRealtimeEvent(userId, { type: 'execution:completed' })
```

## Configuration

All tuneable via `runtimeSettings` (from env):

| Setting | Default | Effect |
|---|---|---|
| `EXECUTION_TIMEOUT_MS` | 900000 | Max wall-clock time per execution |
| `QUEUE_ATTEMPTS` | 4 | Max BullMQ retry attempts |
| `QUEUE_BACKOFF_MS` | 5000 | Backoff base (exponential) |
| `QUEUE_CONCURRENCY` | 5 | Worker jobs in parallel |
| `USER_CONCURRENCY_LIMIT` | 2 | Max concurrent per user |
| `AGENT_CONCURRENCY_LIMIT` | 5 | Max concurrent per agent type |

## Failure Modes

| Failure | Behavior |
|---|---|
| Rate limit exceeded | HTTP 429; client must retry |
| Policy violation | Execution aborted before LLM call |
| LLM API error | BullMQ retry with exponential backoff |
| Validation failure (non-blocking) | Output stored with `validationPassed=false` |
| Validation failure (blocking) | Execution fails; no output stored |
| Hallucination detected (high severity) | Execution fails; event logged |
| Prompt injection in input | Execution aborted; warning logged |
| Timeout | `TtlExpiredError`; execution marked failed |
| Concurrency limit | `ConcurrencyLimitError`; job requeued automatically |
| Max retries exhausted | Dead-letter queue; `execution:failed` event |

## Observability

- Every execution has structured Pino logs via `workerLogger`
- Metrics: `recordWorkerExecution(...)`, `recordQueueMetric(...)`
- Trace spans: `startTraceSpan('queue.execute-agent', ...)`
- All events persisted to `EventLog` table
- Tool calls tracked in `ToolCall` table

## Security Considerations

- Input sanitization via `sanitizeQueuePayload()` before queuing
- Prompt injection detection on user-supplied context
- PII patterns checked in output by hallucination controls
- All executions linked to authenticated `userId`
- Concurrency limits prevent resource abuse per user

## Related Components

- [Governance Layer](governance.md)
- [Queue Infrastructure](queue-infrastructure.md)
- [Real-Time SSE](realtime-sse.md)
- [Observability](observability.md)
- [Execution Lifecycle](../concepts/execution-lifecycle.md)

## Last Updated
2026-05-27

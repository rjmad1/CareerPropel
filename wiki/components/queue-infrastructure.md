# Queue Infrastructure

## Purpose

BullMQ-backed job queue providing reliable, retryable agent execution with dead-letter handling, concurrency governance, and real-time event publishing.

## Responsibilities

- Accept execution jobs from API route
- Distribute jobs across worker processes
- Enforce per-user concurrency limits via Redis slots
- Retry failed jobs with exponential backoff
- Route exhausted jobs to dead-letter queue
- Publish real-time events on job lifecycle transitions
- Expose queue depth and latency metrics

## Dependencies

- `bullmq` — job queue library
- `ioredis` — Redis client (BullMQ transport)
- `src/lib/redis/redisClient` — Redis connection factory
- `src/lib/runtime/settings` — queue configuration
- `src/lib/agents/executor` — execution logic (called by worker)
- `src/lib/observability/metrics` — metric recording

## Queue Names

| Queue | Purpose |
|---|---|
| `agent-execution` | Primary execution queue |
| `agent-execution-dlq` | Dead-letter queue for permanently failed jobs |

Queue names configurable via `EXECUTION_QUEUE_NAME` and `DEAD_LETTER_QUEUE_NAME` env vars.

## Public Interfaces

### Enqueue

```typescript
// src/lib/queue/queues.ts
enqueueExecution(data: ExecutionJobData): Promise<Job>

interface ExecutionJobData {
  executionId: string
  userId: string
  agentType: string
  promptContext: Record<string, string | undefined>
  requestId: string
  correlationId: string
  submittedAt: string
  jobId?: string
}
```

### Dead-Letter

```typescript
enqueueDeadLetter(payload: DeadLetterPayload): Promise<Job>

interface DeadLetterPayload {
  executionId: string
  queueJobId: string
  userId: string
  agentType: string
  failedAt: string
  reason: string
  attemptsMade: number
  correlationId: string
  requestId: string
}
```

### Metrics

```typescript
getQueueMetrics(): Promise<{
  counts: JobCounts,
  averageLatencyMs: number
}>
```

### Worker

```typescript
createExecutionWorker(): Worker
startExecutionWorker(): Promise<Worker>
closeExecutionWorker(): Promise<void>
getWorkerHeartbeat(): Promise<{ queue: JobCounts, timestamp: string }>
```

### Concurrency Slots

```typescript
acquireExecutionSlots(userId, agentType, executionId): Promise<boolean>
releaseExecutionSlots(userId, agentType, executionId): Promise<void>
```

Slots backed by Redis. Returns `false` if at limit → BullMQ treats as `ConcurrencyLimitError` and retries.

### Real-Time Events

```typescript
// src/lib/queue/events.ts
publishRealtimeEvent(userId: string, event: RealtimeEvent): Promise<void>
```

Publishes to Redis pub/sub channel. SSE subscribers (`sharedSubscriber.ts`) receive and forward to connected clients.

## Internal Flow

```
enqueueExecution()
  → executionQueue.add('execute-agent', data, jobOptions)

BullMQ dequeues → processExecution(job)
  → startTraceSpan(...)
  → acquireExecutionSlots(userId, agentType, executionId)
       if false → throw ConcurrencyLimitError → BullMQ retries
  → update AgentExecution.queueJobId
  → publishRealtimeEvent({ type: 'execution:started' })
  → withTimeout(executeAgent(...), 900_000ms)
  → recordQueueMetric(...)
  → releaseExecutionSlots(...)  [finally]

On job failure:
  → classifyError(error) → { failureType, retryable }
  → if !retryable → NonRetryableExecutionError → no BullMQ retry
  → if attemptsMade >= maxAttempts → enqueueDeadLetter(...)
  → publishRealtimeEvent({ type: 'execution:failed' })
```

## Retry Policy

From `src/lib/queue/retry-policy.ts` and `runtimeSettings`:

| Parameter | Default | Notes |
|---|---|---|
| `QUEUE_ATTEMPTS` | 4 | Total attempts (including first try) |
| `QUEUE_BACKOFF_MS` | 5000 | Exponential backoff base |
| Backoff type | Exponential | Doubles each retry |

Non-retryable errors (thrown as `NonRetryableExecutionError`):
- Policy violations
- Prompt injection detected
- Validation hard-failure
- Hallucination block

Retryable errors (BullMQ will retry):
- LLM API transient errors
- `ConcurrencyLimitError` (Redis slot unavailable)
- Network timeouts
- DB write failures

## Stall Detection

```
Worker config:
  maxStalledCount: runtimeSettings.queueMaxStalledCount (default 2)
  lockDuration: runtimeSettings.executionTimeoutMs (15 min)
```

Jobs that stall (worker dies mid-execution) are re-queued up to `maxStalledCount` times. Stall events logged to `queueEvents.on('stalled', ...)`.

## Dead-Letter Queue

Jobs exhausting all retries are moved to `agent-execution-dlq`:
- Payload includes full execution context, failure reason, `attemptsMade`
- DLQ depth tracked in metrics via `updateDlqDepth(depth)`
- Replay: `POST /api/ops/dlq/replay` — re-enqueues DLQ payloads to primary queue
- Inspection: `GET /api/ops/dlq` — returns DLQ job list

## Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `EXECUTION_QUEUE_NAME` | `agent-execution` | Primary queue name |
| `DEAD_LETTER_QUEUE_NAME` | `agent-execution-dlq` | DLQ name |
| `QUEUE_CONCURRENCY` | 5 | Worker concurrency per process |
| `QUEUE_ATTEMPTS` | 4 | Max retries |
| `QUEUE_BACKOFF_MS` | 5000 | Backoff base in ms |
| `QUEUE_MAX_STALLED_COUNT` | 2 | Stall tolerance before DLQ |
| `EXECUTION_TIMEOUT_MS` | 900000 | Execution wall-clock limit |
| `USER_CONCURRENCY_LIMIT` | 2 | Per-user slot limit |
| `AGENT_CONCURRENCY_LIMIT` | 5 | Per-agent-type slot limit |
| `MAX_QUEUE_PAYLOAD_BYTES` | 32768 | Max job payload size |

## Failure Modes

| Scenario | Behavior |
|---|---|
| Redis unavailable at startup | Process fails to start |
| Redis drops mid-operation | BullMQ reconnects automatically |
| Worker process crashes | BullMQ stall detection requeues after lock timeout |
| All retries exhausted | DLQ enqueue + `execution:failed` event |
| Payload too large | Sanitizer truncates to `MAX_QUEUE_PAYLOAD_BYTES` |
| Concurrency limit reached | Job retried; not moved to DLQ |

## Observability

- `recordQueueMetric(queueName, durationMs, success)` on every completion
- `recordWorkerExecution(workerName, durationMs, success)` per job
- `recordWorkerRetry(workerName)` on concurrency limit hit
- `GET /api/ops/queue` — live job counts (active, waiting, delayed, failed, completed)
- `GET /api/ops/metrics` — aggregated latency percentiles

## Security Considerations

- `sanitizeQueuePayload()` strips oversized or PII-containing context before enqueuing
- Job IDs are deterministic: `executionId` used as BullMQ jobId — prevents duplicate enqueue
- Redis connections use named prefixes (`career-propel:queue`, `career-propel:worker`) for namespace isolation

## Related Components

- [Agent System](agent-system.md)
- [Real-Time SSE](realtime-sse.md)
- [Observability](observability.md)
- [Worker Runtime](../services/worker-runtime.md)

## Last Updated
2026-05-27

# Worker Runtime

## Purpose

The worker process dequeues agent execution jobs from BullMQ and runs them to completion.

## Responsibilities

- Poll BullMQ `agent-execution` queue for jobs
- Execute agent logic via `executeAgent()`
- Enforce execution timeouts
- Manage Redis-backed concurrency slots
- Publish real-time events on job transitions
- Classify failures and route exhausted jobs to DLQ
- Record metrics and trace spans

## Entry Point

`src/bin/worker.ts`

```typescript
registerGracefulShutdown('worker')
await startExecutionWorker()
```

## Internal Behavior

Calls `createExecutionWorker()` which creates a BullMQ `Worker` with:

```typescript
{
  concurrency: runtimeSettings.queueConcurrency,  // default 5
  autorun: false,
  maxStalledCount: runtimeSettings.queueMaxStalledCount,  // default 2
  lockDuration: runtimeSettings.executionTimeoutMs,  // default 900,000ms
  metrics: { maxDataPoints: 1000 }
}
```

## Job Processing Flow

Per job:

1. Acquire Redis concurrency slots for `(userId, agentType)`
2. Update `AgentExecution` with `queueJobId`, `attempts`
3. Publish `execution:started` event
4. Run `executeAgent()` within `withTimeout(fn, executionTimeoutMs)`
5. On success: record metrics, publish `execution:completed`
6. On failure: classify error → if non-retryable → throw `NonRetryableExecutionError`
7. On final failure: `enqueueDeadLetter()` + publish `execution:failed`
8. Release concurrency slots in `finally`

## Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `REDIS_URL` | `redis://127.0.0.1:6379` | BullMQ connection |
| `DATABASE_URL` | required | Prisma connection |
| `EXECUTION_TIMEOUT_MS` | 900000 | Per-job wall-clock limit |
| `QUEUE_CONCURRENCY` | 5 | Parallel jobs per process |
| `QUEUE_ATTEMPTS` | 4 | Max retries per job |
| `QUEUE_BACKOFF_MS` | 5000 | Retry backoff base (exponential) |
| `ANTHROPIC_API_KEY` | required | LLM provider |
| `USER_CONCURRENCY_LIMIT` | 2 | Max active per user |
| `AGENT_CONCURRENCY_LIMIT` | 5 | Max active per agent type |

## Graceful Shutdown

On `SIGTERM`/`SIGINT`:
1. `worker.close()` — stop accepting new jobs
2. Wait for active jobs to complete (up to lock duration)
3. Close Redis connections

## Scaling

Run multiple worker processes to increase throughput. BullMQ distributes jobs across all connected workers. Ensure Redis is accessible by all worker instances.

Redis concurrency slots (`acquireExecutionSlots`) ensure global limits respected across all workers.

## Failure Modes

| Failure | Behavior |
|---|---|
| Redis connection lost | Worker pauses; reconnects automatically |
| DB write failure | Job retried via BullMQ |
| Anthropic API 5xx | Job retried with backoff |
| Job exceeds timeout | `TtlExpiredError`; marked as retryable |
| Stalled job | Requeued up to `maxStalledCount` times |
| All retries exhausted | Dead-letter queue |

## Observability

- Logs via `createLogger({ component: 'worker' })`
- `recordWorkerExecution(...)` per job completion
- `recordWorkerRetry(...)` per concurrency limit hit
- Trace spans via `startTraceSpan('queue.execute-agent', ...)`
- Stall events logged on `queueEvents.on('stalled', ...)`

## Last Updated
2026-05-27

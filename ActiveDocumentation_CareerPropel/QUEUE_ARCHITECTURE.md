# Queue Architecture

## Queues

- `agent-execution`: primary async execution queue
- `agent-execution-dlq`: terminal failures for escalation and inspection

## Job Payload

Each execution job carries:

- `executionId`
- `userId`
- `agentType`
- sanitized `promptContext`
- `requestId`
- `correlationId`
- `submittedAt`
- optional `jobId`

Payloads are sanitized before enqueueing to avoid leaking secrets or oversized content into Redis.

## Worker Semantics

- Job processing is immediate after `queue.add()`.
- Worker acquires per-user and per-agent Redis slots before execution.
- Long-running work is bounded by `EXECUTION_TIMEOUT_MS`.
- Retryable failures are retried with exponential backoff.
- Non-retryable failures fail fast.

## Dead-Letter Flow

When attempts are exhausted:

1. BullMQ marks the job failed.
2. Worker records dead-letter metadata into `agent-execution-dlq`.
3. Realtime failure event is published.
4. Operators can inspect and replay manually.

## Realtime Event Flow

1. Web and worker publish execution events to `agent-events:{userId}`.
2. Shared process subscriber uses pattern subscription `agent-events:*`.
3. Internal event emitter fans updates to active SSE streams.
4. SSE route refreshes execution state and pushes `execution:update` or `log:new`.

## Recovery

- Worker restart: BullMQ reclaims active jobs.
- Redis reconnect: ioredis retry strategy re-establishes queue and pub/sub links.
- Scheduler cleanup keeps completed and failed jobs bounded.

# CareerPropel Architecture

## Runtime Topology

CareerPropel remains a modular monolith. Business domains stay in-process and continue to use Next.js App Router, Prisma, PostgreSQL, Redis, BullMQ, and SSE.

The production topology is now split into three deterministic runtimes:

1. `web`
  - Serves the Next.js frontend and API routes.
  - Accepts orchestration requests such as `POST /api/agents/execute`.
  - Streams execution updates over SSE.
  - Never executes long-running AI work inline.

2. `worker`
  - Runs BullMQ consumers.
  - Executes AI workloads, retries, and queue-backed orchestration.
  - Enforces per-user and per-agent concurrency limits.

3. `scheduler`
  - Owns queue cleanup, recurring registration, and queue maintenance.
  - Runs as a singleton.

## Execution Flow

1. Client calls `POST /api/agents/execute`.
2. Web runtime persists `AgentExecution`, logs the enqueue event, and adds a BullMQ job.
3. Worker consumes immediately and updates execution state in Prisma.
4. Worker publishes realtime events through Redis pub/sub.
5. A shared Redis subscriber fans events out to SSE clients.
6. `GET /api/agent/execution/[executionId]/subscribe` streams state and logs to the browser.

No cron-based orchestration remains in the critical path.

## Queue Model

- Canonical queue: `agent-execution`
- Dead-letter queue: `agent-execution-dlq`
- Job idempotency key: `executionId`
- Retry policy: exponential backoff with retry classification
- Recovery: BullMQ worker retries plus scheduler cleanup
- Concurrency: per-user and per-agent slot guards in Redis

## Realtime Model

- Canonical transport: SSE
- Redis pub/sub fanout: one shared subscriber per process
- No per-client Redis subscriptions
- Heartbeats keep idle streams alive
- Execution logs and status both flow through the same event spine

## Operational Guarantees

- Dedicated runtimes eliminate serverless execution ambiguity.
- Workers scale independently from web.
- Queue-backed execution survives worker restarts.
- Structured logging uses Pino with log redaction.
- Health endpoints: `/health`, `/ready`, `/live`
- Metrics snapshot includes queue, worker, and provider counters.

## BullMQ Version Note

BullMQ v5 no longer exports the legacy `QueueScheduler` class in the package entrypoint. The singleton scheduler runtime in this repo therefore owns queue maintenance, cleanup, and future recurring registration using BullMQ v5 primitives while preserving the required separate scheduler process model.

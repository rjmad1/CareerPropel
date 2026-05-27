# Scheduler Runtime

## Purpose

The scheduler process runs periodic maintenance tasks using BullMQ's Scheduler. Handles stale execution cleanup and DLQ monitoring.

## Responsibilities

- Clean up stale `AgentExecution` records that exceeded TTL but were never marked complete
- Sweep dead-letter queue
- Schedule recurring maintenance jobs

## Entry Point

`src/bin/scheduler.ts`

```typescript
registerGracefulShutdown('scheduler')
await startQueueScheduler()
```

## Behavior

From `src/lib/queue/scheduler.ts`:

- Registers a repeating BullMQ job running every `schedulerCleanupIntervalMs` (default 5 minutes = 300,000ms)
- Scans `AgentExecution` for records in `running` status beyond `executionTtlSeconds` (default 900s)
- Marks them `failed` with `errorMessage: 'Execution timed out'`
- Updates DLQ depth metric via `updateDlqDepth(depth)`

## Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `REDIS_URL` | `redis://127.0.0.1:6379` | BullMQ connection |
| `DATABASE_URL` | required | Prisma connection |
| `SCHEDULER_CLEANUP_INTERVAL_MS` | 300000 | Cleanup run frequency (5 min) |
| `EXECUTION_TIMEOUT_MS` | 900000 | TTL threshold for stale detection |

## Scaling

Run as a **single instance only**. BullMQ Scheduler ensures deduplication — multiple scheduler instances would create duplicate scheduled jobs.

## Graceful Shutdown

On `SIGTERM`/`SIGINT`: close BullMQ Scheduler connection cleanly.

## Failure Modes

| Failure | Behavior |
|---|---|
| Redis unavailable | Scheduler cannot start; process exits |
| DB unavailable | Cleanup job fails silently; retried on next interval |
| Scheduler process down | Stale executions accumulate until restarted |

## Observability

- Logs via `createLogger({ runtime: 'scheduler' })`
- Each cleanup run logs count of stale executions found

## Last Updated
2026-05-27

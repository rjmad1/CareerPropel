# Deployment Topology

## Purpose

Describes how the three CareerPropel processes deploy and communicate in production.

## Processes

| Process | Start Command | Responsibilities |
|---|---|---|
| `web` | `npm run start:web` | HTTP API, Next.js pages, SSE endpoints |
| `worker` | `npm run start:worker` | BullMQ job processing, agent execution |
| `scheduler` | `npm run start:scheduler` | Stale execution cleanup, scheduled maintenance |

All three must be running for full functionality.

## Infrastructure Requirements

| Service | Purpose | Required By |
|---|---|---|
| PostgreSQL 15+ | Persistent data store | web, worker |
| Redis 7+ | BullMQ queue, pub/sub | web, worker, scheduler |
| Anthropic API | LLM calls | worker |

## Environment Variables

See [Getting Started](../../docs/getting-started.md) for the full variable list.

Critical production values:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `NEXTAUTH_SECRET` — Must be a strong random secret
- `ANTHROPIC_API_KEY` — Anthropic API key

## Docker

A `Dockerfile` and `docker-compose.yml` are provided.

The Dockerfile runs the web process by default (`CMD ["npm", "run", "start:web"]`). Worker and scheduler require separate container instances with their respective start commands.

```yaml
# Minimal compose structure
services:
  web:
    command: npm run start:web
  worker:
    command: npm run start:worker
  scheduler:
    command: npm run start:scheduler
  postgres: ...
  redis: ...
```

## Health / Readiness Probes

| Endpoint | Type | Purpose |
|---|---|---|
| `GET /health` | Liveness | Process alive check |
| `GET /ready` | Readiness | DB + Redis connectivity check |

## Graceful Shutdown

All processes register `registerGracefulShutdown(name)` which listens for `SIGTERM`/`SIGINT` and:

1. Stops accepting new work
2. Closes queue connections
3. Closes DB connection
4. Exits cleanly

Worker process additionally waits for in-flight executions to complete or timeout before shutdown.

## Scaling Considerations

### Horizontal Scaling

- **Web**: Stateless — scale freely behind a load balancer
- **Worker**: Scale worker replicas to increase execution throughput; BullMQ distributes jobs across workers automatically
- **Scheduler**: Run as a single instance; BullMQ Scheduler handles deduplication

### Concurrency Limits

From `runtimeSettings`:
- `USER_CONCURRENCY_LIMIT` (default 2) — max simultaneous executions per user; enforced via Redis slots
- `AGENT_CONCURRENCY_LIMIT` (default 5) — max per agent type
- `QUEUE_CONCURRENCY` (default 5) — BullMQ worker concurrency (jobs processed simultaneously per worker process)

### Queue Tuning

| Setting | Default | Notes |
|---|---|---|
| `QUEUE_ATTEMPTS` | 4 | Retry attempts per job |
| `QUEUE_BACKOFF_MS` | 5000 | Exponential backoff base |
| `EXECUTION_TIMEOUT_MS` | 900000 | 15 min per execution |
| `QUEUE_MAX_STALLED_COUNT` | 2 | Stall requeue limit before DLQ |

## Network Topology

```
Internet → Load Balancer → Web instances (port 3000)
                                 │
                         PostgreSQL (internal)
                         Redis (internal)
                                 │
                        Worker instances
                        Scheduler instance
                                 │
                        Anthropic API (external)
```

## Observability Endpoints

Available on the web process:

| Endpoint | Returns |
|---|---|
| `GET /api/ops/metrics` | Aggregate metrics snapshot |
| `GET /api/ops/queue` | BullMQ job counts |
| `GET /api/ops/providers` | Provider health reports |
| `GET /api/ops/dlq` | Dead-letter queue depth |
| `GET /api/ops/cost` | Cost analytics |
| `GET /api/ops/alerts` | Active alerts |
| `GET /api/ops/executions` | Execution history |

## Last Updated
2026-05-27

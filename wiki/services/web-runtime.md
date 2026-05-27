# Web Runtime

## Purpose

The web process serves the Next.js application — HTTP API routes, SSE endpoints, and React pages.

## Responsibilities

- Serve Next.js App Router pages and API routes
- Handle authentication via NextAuth
- Accept agent execution requests and enqueue to BullMQ
- Serve SSE streams for real-time execution updates
- Expose operational monitoring endpoints
- Perform health/readiness checks

## Entry Point

`src/bin/web.ts`

Spawns `next start -p <PORT> -H <HOSTNAME>` as a child process and registers graceful shutdown hooks.

```typescript
spawn(nextBinary, ['start', '-p', String(runtimeSettings.defaultPort), ...])
```

## Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `PORT` | 3000 | HTTP listen port |
| `HOSTNAME` | `0.0.0.0` | Bind address |
| `DATABASE_URL` | required | PostgreSQL connection |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis for queue events |
| `NEXTAUTH_URL` | required | Auth callback base URL |
| `NEXTAUTH_SECRET` | required | Session JWT secret |

## Health Endpoints

| Path | Purpose |
|---|---|
| `GET /health` | Liveness — returns 200 if process is alive |
| `GET /ready` | Readiness — checks DB + Redis connectivity |

## Start Commands

```bash
# Development (hot reload)
npm run dev

# Production
npm run start:web
```

## Graceful Shutdown

On `SIGTERM`/`SIGINT`:
1. Stop accepting new requests
2. Drain in-flight requests
3. Close child Next.js process
4. Exit

## Failure Modes

| Failure | Behavior |
|---|---|
| DB unavailable | `/ready` returns 503; API routes return 500 |
| Redis unavailable | Queue enqueue fails; SSE pub/sub unavailable |
| `next start` crash | Parent process exits; supervisor should restart |

## Observability

Logs via `createLogger({ runtime: 'web' })` — Pino JSON to stdout.

## Last Updated
2026-05-27

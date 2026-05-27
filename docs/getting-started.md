# Getting Started

## Purpose

Local development setup for CareerPropel. Covers prerequisites, environment, database, and running all three processes.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or Docker)
- Redis 7+ (local or Docker)
- `npm` (package manager)

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure Environment

Copy the example env file and fill in required values:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — (required) |
| `REDIS_URL` | Redis connection string | `redis://127.0.0.1:6379` |
| `NEXTAUTH_URL` | Auth callback base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth JWT secret | — (required) |
| `ANTHROPIC_API_KEY` | Anthropic API key for agent execution | — (required for agents) |

Optional runtime tuning (all have defaults):

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Web server port |
| `EXECUTION_TIMEOUT_MS` | `900000` | Agent execution TTL (15 min) |
| `QUEUE_CONCURRENCY` | `5` | Worker concurrency |
| `QUEUE_ATTEMPTS` | `4` | Max retry attempts per job |
| `SSE_HEARTBEAT_MS` | `15000` | SSE heartbeat interval |
| `USER_CONCURRENCY_LIMIT` | `2` | Max concurrent executions per user |
| `LOG_LEVEL` | `info` | Pino log level |

## 3. Database Setup

```bash
# Apply migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

## 4. Start All Processes

Open three terminals (or use a process manager):

```bash
# Terminal 1 — Web server
npm run start:web
# or for hot reload:
npm run dev

# Terminal 2 — BullMQ Worker
npm run start:worker

# Terminal 3 — Queue Scheduler
npm run start:scheduler
```

The web UI is at `http://localhost:3000`.

## 5. Health Checks

```bash
curl http://localhost:3000/health   # liveness
curl http://localhost:3000/ready    # readiness
```

## Docker Compose

A `docker-compose.yml` is provided for PostgreSQL + Redis:

```bash
docker compose up -d
```

Then run the Node processes locally against the Docker services.

## Useful Scripts

```bash
npm run lint          # ESLint
npm run type-check    # TypeScript strict check
npm run test          # Jest unit tests
npm run test:e2e      # Playwright/Cypress E2E
npm run db:studio     # Prisma Studio (DB GUI)
```

## Related

- [Development Workflow](development-workflow.md)
- [Runtime Settings](../wiki/services/web-runtime.md)
- [Deployment Topology](../wiki/architecture/deployment-topology.md)

## Last Updated
2026-05-27

# Local Development

## Full Stack

Use Docker Compose for local parity:

```bash
docker compose up --build
```

This starts:

- web on `http://localhost:3000`
- worker
- scheduler
- Redis on `localhost:6379`
- PostgreSQL on `localhost:5432`

## Native Workflow

1. Start dependencies:

```bash
docker compose up redis postgres
```

2. Run Prisma migration or push:

```bash
npx prisma migrate dev
```

3. Start runtimes in separate terminals:

```bash
npm run dev
npm run start:worker
npm run start:scheduler
```

## Validation

- `POST /api/agents/execute` should return an `executionId` immediately.
- `GET /api/agent/execution/[executionId]/subscribe` should stream updates.
- `GET /health` should show queue counts and runtime metrics.

## Notes

- The scheduler runtime is required even in local development.
- SSE is the canonical realtime transport for execution updates.
- WebSocket routes now return `410 Gone`.

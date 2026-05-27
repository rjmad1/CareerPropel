# Local Development Runbook

## Purpose

Step-by-step operational guide for common local development tasks.

## Starting the Full Stack Locally

```bash
# 1. Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# 2. Apply DB migrations
npm run db:migrate

# 3. Terminal 1 — Web
npm run dev

# 4. Terminal 2 — Worker
npm run start:worker

# 5. Terminal 3 — Scheduler
npm run start:scheduler
```

Health check: `curl http://localhost:3000/health` → `{ "status": "ok" }`

## Triggering an Agent Execution

```bash
curl -X POST http://localhost:3000/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agentType": "job-match",
    "context": {
      "resume": "Software Engineer with 5 years experience...",
      "jobDescription": "Senior Engineer at Acme Corp..."
    }
  }'
```

Response:
```json
{ "executionId": "clxyz...", "status": "queued" }
```

## Watching Real-Time Execution Updates

```bash
# Subscribe to SSE stream for an execution
curl -N http://localhost:3000/api/agent/execution/<executionId>/subscribe
```

## Checking Queue Health

```bash
# Queue job counts
curl http://localhost:3000/api/ops/queue

# Full metrics snapshot
curl http://localhost:3000/api/ops/metrics

# Provider health
curl http://localhost:3000/api/ops/providers
```

## Inspecting Dead-Letter Queue

```bash
# View DLQ contents
curl http://localhost:3000/api/ops/dlq

# Replay DLQ jobs
curl -X POST http://localhost:3000/api/ops/dlq/replay
```

## Database Operations

```bash
# Open Prisma Studio (DB browser GUI)
npm run db:studio

# Run a specific migration
npm run db:migrate

# Reset DB (destructive — dev only)
npx prisma migrate reset
```

## Debugging Agent Execution

1. Get execution details:
   ```bash
   curl http://localhost:3000/api/agent/execution/<executionId>
   ```

2. Fetch execution logs:
   ```bash
   curl "http://localhost:3000/api/agent/execution/<executionId>/logs?pageSize=100"
   ```

3. Check structured logs (worker terminal) for the `executionId`

4. Query DB directly:
   ```sql
   SELECT * FROM "AgentExecution" WHERE id = '<executionId>';
   SELECT * FROM "EventLog" WHERE "executionId" = '<executionId>' ORDER BY timestamp;
   ```

## Registering a New Prompt Version

```typescript
// In a migration script or admin API:
import { registerPromptVersion } from '@/lib/governance/promptRegistry'

await registerPromptVersion({
  agentType: 'interview-prep',
  version: '1.1.0',
  systemPrompt: '...',
  userPromptTemplate: '...',
  changelog: 'Improved negotiation guidance',
  createdBy: 'your-name',
  activate: true,
})
```

## Rolling Back a Prompt Version

```typescript
import { rollbackPromptVersion } from '@/lib/governance/promptRegistry'
await rollbackPromptVersion('interview-prep', '1.0.0')
```

## Common Issues

### Worker not processing jobs

- Check Redis is running: `docker compose ps`
- Check worker terminal for error logs
- Verify `REDIS_URL` in `.env.local`
- Check BullMQ queue via Prisma Studio or `GET /api/ops/queue`

### SSE stream not receiving updates

- Confirm worker process is running
- Confirm Redis pub/sub connectivity
- Check browser DevTools Network tab for SSE connection status
- Verify `x-accel-buffering: no` header present

### Policy violation errors

- Check `policyEngine.ts` limits for agent type
- Reduce `context` payload size if hitting `maxInputContextChars`
- Check `USER_CONCURRENCY_LIMIT` if hitting concurrency errors

### Validation failures

- Check `outputValidator.ts` for agent-specific schema
- Raw output available in `AgentExecution.output` JSON
- Validation errors in `AgentExecution.validationErrors`

## Environment Reference

See [Getting Started](../../docs/getting-started.md) for full env variable list.

## Last Updated
2026-05-27

# Operations Runbook

## Purpose

Day-to-day production operations guide. Covers monitoring, incident response, and maintenance procedures.

## Health Monitoring

### Endpoints

| Check | Endpoint | Expected |
|---|---|---|
| Liveness | `GET /health` | `200 { "status": "ok" }` |
| Readiness | `GET /ready` | `200 { "status": "ready" }` |
| Queue depth | `GET /api/ops/queue` | `waiting < 100` |
| Provider health | `GET /api/ops/providers` | All `status: healthy` |
| DLQ | `GET /api/ops/dlq` | `depth: 0` |
| Metrics | `GET /api/ops/metrics` | `failureRate < 0.05` |

### Alert Thresholds (verify in `src/lib/observability/alerts.ts`)

- Queue failure rate > 5%
- Provider degradation score > 50
- DLQ depth > 10
- Concurrency at 100% of limit
- SSE heartbeat failures > 10

---

## Incident: High Queue Failure Rate

1. `GET /api/ops/metrics` — identify failing queue name and failure rate
2. `GET /api/ops/providers` — check if provider is degraded
3. If provider degraded: wait for provider recovery (Anthropic status page)
4. `GET /api/ops/dlq` — check DLQ depth
5. Check worker logs for error patterns
6. If systematic validation failures: review recent prompt version changes
7. Once root cause resolved: `POST /api/ops/dlq/replay` to process DLQ

---

## Incident: Provider Degraded

Degradation score > 50 triggers warning. Score > 80 triggers critical.

1. `GET /api/ops/providers` — identify degraded provider and score
2. Check Anthropic API status page
3. Monitor `fallbackRate` — system should auto-fallback to secondary provider
4. If primary provider down: consider setting secondary as primary in `providerQualification.ts`
5. Scores reset automatically as new healthy observations arrive

---

## Incident: DLQ Accumulation

1. `GET /api/ops/dlq` — inspect job reasons
2. Categorize: transient errors vs. systematic failures
3. If transient (provider outage now resolved): `POST /api/ops/dlq/replay`
4. If systematic (validation/policy): fix root cause first, then replay
5. Monitor `GET /api/ops/metrics` after replay to ensure jobs complete

---

## Incident: Stale Executions

Executions stuck in `running` state beyond TTL:

1. Check if scheduler process is running
2. If scheduler down: restart it — cleanup runs within 5 minutes
3. If scheduler running but executions still stuck: check DB directly
   ```sql
   SELECT id, agentType, status, "startedAt", "updatedAt"
   FROM "AgentExecution"
   WHERE status = 'running'
   AND "startedAt" < NOW() - INTERVAL '20 minutes';
   ```
4. Manual fix if needed:
   ```sql
   UPDATE "AgentExecution"
   SET status = 'failed', "errorMessage" = 'Manually resolved stale execution'
   WHERE id = '<id>';
   ```

---

## Incident: Redis Unavailable

All three processes depend on Redis:

1. Restore Redis service
2. BullMQ workers will reconnect automatically
3. Verify with `GET /api/ops/queue` — should return counts again
4. Check for jobs that need replay after downtime

---

## Incident: Database Unavailable

1. Restore PostgreSQL service
2. Workers will retry DB operations automatically
3. Check for executions stuck in `running` (may need manual state correction)
4. Run `npm run db:migrate` to verify schema is current after recovery

---

## Maintenance: Rotate `NEXTAUTH_SECRET`

**Effect**: All existing sessions are invalidated. Users must log in again.

1. Generate new secret: `openssl rand -base64 32`
2. Update `NEXTAUTH_SECRET` in environment
3. Restart web process
4. Notify users of session reset if needed

---

## Maintenance: Apply Database Migration

```bash
npm run db:migrate
```

- Run during low-traffic window
- Migrations in `prisma/migrations/` are applied in order
- Always test in staging first

---

## Maintenance: Prompt Version Rollback

```typescript
// Via admin script or API:
import { rollbackPromptVersion } from '@/lib/governance/promptRegistry'
await rollbackPromptVersion('interview-prep', '1.0.0')
```

Verify by checking new execution `promptVersionId` links to the rolled-back version.

---

## Cost Monitoring

`GET /api/ops/cost` — token usage and USD cost per agent type.

Cost per model (from `policyEngine.ts`):
- `claude-sonnet-4-6`: $3/M input, $15/M output
- `claude-opus-4-7`: $15/M input, $75/M output
- `claude-haiku-4-5-20251001`: $0.80/M input, $4/M output

Per-execution cost limits enforced by `maxCostUsdPerExecution` policy field.

---

## Audit Logs

`GET /api/audit-logs` — query security-sensitive events.

DB table: `AuditLog`. Written by `src/lib/logging/auditLog.ts` for:
- Auth events
- 2FA changes
- API key operations
- Admin actions

---

## Last Updated
2026-05-27

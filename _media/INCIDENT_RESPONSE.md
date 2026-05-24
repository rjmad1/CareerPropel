# Runbook: Incident Response

**Owner**: Platform Engineering  
**Last Updated**: 2026-05-21

---

## Severity Levels

| Severity | Definition | Response SLA |
|---|---|---|
| P1 Critical | Production down, data loss, security breach | Immediate |
| P2 High | Core feature broken for all users | < 1 hour |
| P3 Medium | Degraded experience, workaround available | < 4 hours |
| P4 Low | Minor issue, cosmetic, edge case | Next sprint |

---

## P1 / P2 Response Procedure

### 1. Detect

Sources:
- Vercel deployment logs (log drain)
- PostgreSQL error rate spike
- Redis connection failures in structured logs
- User-reported via GitHub Issues (label: `bug/severity-critical`)

### 2. Contain

**Application-level kill switches** (no deploy required):

```bash
# Disable AI features
ANTHROPIC_API_KEY=""   # Fallback to heuristics

# Disable scraping
SCRAPING_GLOBAL_KILL_SWITCH=true

# Disable LinkedIn scraping only
LINKEDIN_SCRAPING_ENABLED=false

# Disable Indeed scraping only
INDEED_SCRAPING_ENABLED=false

# Disable development bypass (ensure auth is enforced)
ALLOW_DEV_LOGIN=false
```

**Rollback to previous Vercel build**:
1. Open Vercel dashboard → Project → Deployments
2. Find last successful deployment
3. Click "..." → "Promote to Production"

### 3. Diagnose

```bash
# Check recent error logs (Vercel log drain or local)
# Look for: level: "error", correlationId, userId, module

# Check database connectivity
npx prisma db execute --stdin <<< "SELECT 1"

# Check Redis
redis-cli -h $REDIS_HOST -p $REDIS_PORT ping

# Check active migrations
npx prisma migrate status
```

### 4. Fix

- For schema migrations: use `npx prisma migrate resolve --rolled-back <migration-name>` if migration
  must be rolled back
- For application bugs: fix in code, deploy via Vercel
- For security incidents: see Security Incident procedure below

### 5. Post-Incident

Within 24 hours of P1/P2 resolution:
- Document in `docs/governance/risk-registry.md` if architectural debt is revealed
- Create GitHub issue with label `post-mortem`
- Add regression test

---

## Database Failure

```bash
# Verify connection
npx prisma db execute --stdin <<< "SELECT version()"

# If connection refused, check PostgreSQL service status
# Verify DATABASE_URL environment variable is correct

# Run pending migrations
npx prisma migrate deploy

# Emergency: reset migration state (destructive — production only with approval)
# npx prisma migrate resolve --applied <migration-name>
```

---

## Redis Failure

Rate limiting and real-time features degrade gracefully (fail-open per DEBT-002):
- Rate limiter logs `warn` and allows requests through
- WebSocket / Socket.IO events may not broadcast

Recovery:
```bash
redis-cli -h $REDIS_HOST ping
# If DOWN: restart Redis service or failover to replica
```

---

## Security Incident

1. **Isolate**: Revoke affected API keys / sessions immediately
2. **Preserve evidence**: Export logs before taking any destructive action
3. **Contain**: Disable affected feature via env var
4. **Assess**: Determine blast radius — which users/data affected
5. **Notify**: If user data exposed, legal/privacy notification obligations apply
6. **Remediate**: Patch, rotate secrets, deploy
7. **Document**: Create private GitHub Security Advisory

---

## AI / LLM Incidents

See `docs/governance/AI_GOVERNANCE.md` → "Incident Response" section.

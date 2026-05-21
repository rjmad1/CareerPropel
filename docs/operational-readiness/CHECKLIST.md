# Production Operational Readiness Checklist

Use this checklist for any Large or Architectural change before deploying to production.
For smaller changes, the PR template checklist is sufficient.

For each item, complete the full Operational Readiness template at
`templates/operational-readiness.md` and store at `docs/operational-readiness/<feature>-OR.md`.

---

## Tier 1: Code & Quality

- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] All unit tests pass (`npm test`)
- [ ] Coverage does not regress below baseline
- [ ] `npm audit --audit-level=high` passes

## Tier 2: Database & State

- [ ] Prisma migration written, tested locally
- [ ] Migration is additive (no destructive changes) or rollback SQL provided
- [ ] Migration tested on a database snapshot similar to production
- [ ] `npx prisma migrate status` shows no pending/failed migrations in staging

## Tier 3: Security

- [ ] All new routes have `getAuthContext()` or `withAuth`
- [ ] Ownership checks verified for all user-scoped data
- [ ] New environment variables documented in `.env.example`
- [ ] No secrets in code or logs
- [ ] Security review completed for auth/AI/data changes

## Tier 4: Observability

- [ ] Structured logs at entry/exit for new code paths
- [ ] Error conditions logged at `error` level with context
- [ ] Correlaton IDs propagated through request chain
- [ ] No new unhandled promise rejections

## Tier 5: Rollback Readiness

- [ ] Feature flag or env var can disable feature without redeploy
- [ ] Database rollback procedure documented
- [ ] Rollback steps manually verified (mentally or in staging)
- [ ] Previous production build identified in Vercel dashboard

## Tier 6: Environment Preparation

- [ ] All new env vars set in Vercel production environment
- [ ] External service credentials provisioned
- [ ] Vercel preview deployment tested manually

## Tier 7: Documentation

- [ ] Spec file updated to reflect actual implementation
- [ ] API contract updated if routes changed
- [ ] `docs/schema/DATABASE_SCHEMA.md` updated for schema changes
- [ ] `docs/governance/risk-registry.md` updated if technical debt introduced

---

## Sign-Off

| Check | Status | Notes |
|---|---|---|
| Code quality | Pass / Fail | |
| Security | Pass / Fail | |
| Database | Pass / Fail | |
| Observability | Pass / Fail | |
| Rollback ready | Pass / Fail | |

**Decision**: Ready to deploy / Blocked by [reason]

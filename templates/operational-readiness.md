# Operational Readiness Review: [Feature / Change Name]

**Status**: Draft | Reviewed | Approved  
**Feature/Spec**: [Link to product or technical spec]  
**Owner**: [Name]  
**Review Date**: YYYY-MM-DD  
**Target Deploy Date**: YYYY-MM-DD

---

## Summary

<!-- One paragraph: what is being deployed and why this review is needed. -->

## Deployment Overview

- **Deployment type**: [Schema migration / API change / UI change / Config change]
- **Migration required**: [Yes / No — if yes, is it reversible?]
- **Feature flag**: [Yes — `FEATURE_FLAG_NAME` / No]
- **Estimated deploy window**: [Duration or maintenance window needed]
- **Rollout strategy**: [Immediate / Gradual / Canary / Blue-green]

## Logging

- [ ] Structured logs at request entry/exit with `correlationId`, `userId`
- [ ] Error states logged at `error` level with full context
- [ ] No PII/secrets logged
- [ ] Log level appropriate (debug → info → warn → error)

**New log events added**:
```
[module] event: "..." level: info/warn/error fields: {correlationId, userId, ...}
```

## Metrics

- [ ] Key business metrics tracked (conversions, errors, latency)
- [ ] Existing dashboards still valid

**New metrics / counters**:
- `[metric_name]`: [What it measures, unit]

## Alerting

- [ ] Alert exists for critical failure mode
- [ ] Alert runbook linked

**New alerts**:
| Alert | Condition | Severity | Runbook |
|---|---|---|---|
| [Alert name] | [Threshold] | Critical / High / Medium | [Link] |

## Recovery Procedures

### Rollback Steps

1. [Step 1: e.g., set feature flag to false / disable env var]
2. [Step 2: e.g., run rollback migration: `npx prisma migrate resolve --rolled-back <migration>`]
3. [Step 3: e.g., redeploy previous Vercel build via dashboard]
4. [Step 4: verify health endpoint responds 200]

**Rollback validation**: [How to confirm rollback was successful]

## Blast Radius Analysis

- **If this fails completely**: [What user-facing impact? Which features break?]
- **Cascade risk**: [Does failure here cause failures elsewhere?]
- **Data risk**: [Is any data at risk of corruption or loss?]
- **Estimated affected users**: [Number / percentage of user base]

## Capacity & Performance

- **Expected load increase**: [req/min or data volume delta]
- **DB query impact**: [New slow queries? Explain plans reviewed?]
- **Cache pressure**: [New Redis keys? TTL strategy?]
- **Memory / CPU delta**: [Estimated worker resource increase]

## Pre-Deploy Checklist

- [ ] All tests pass in CI
- [ ] Migration tested on staging database
- [ ] `.env.example` updated for any new env vars
- [ ] Environment variables set in production (Vercel / infra)
- [ ] Feature flag configured and defaulting to OFF
- [ ] Rollback procedure documented and tested mentally
- [ ] Monitoring dashboards checked for baseline before deploy

## Post-Deploy Validation

- [ ] Health endpoint returns 200 within 5 minutes
- [ ] No spike in error logs (check Vercel log drain)
- [ ] Key user flow manually verified
- [ ] Feature flag enabled for gradual rollout (if applicable)
- [ ] Alert thresholds not triggered within 30 minutes

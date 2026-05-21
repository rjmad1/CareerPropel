# Service Level Objectives (SLOs)

**Last Updated**: 2026-05-21  
**Status**: Aspirational — not yet enforced by monitoring

---

## Availability

| Service | SLO | Notes |
|---|---|---|
| Core web application | 99.5% uptime | Vercel infrastructure |
| API routes (CRUD) | 99.5% success rate | Excludes AI routes |
| AI-powered features | 95% success rate | Fallback to heuristics counts as success |
| Real-time (WebSocket) | 99% connection success | Degraded experience acceptable |

---

## Latency (p95)

| Endpoint Class | Target | Notes |
|---|---|---|
| Page load (SSR) | < 2s TTFB | Lighthouse CI enforces budget |
| CRUD API routes | < 500ms | Target with DB query + auth check |
| AI generation endpoints | < 10s | LLM latency is variable |
| Job search (scraping) | < 30s queue acknowledgment | Async, not synchronous |

---

## Error Budget

Based on 99.5% availability SLO:
- Monthly error budget: 3.65 hours of downtime
- Alert threshold: If daily error rate exceeds 1%, investigate
- Burn rate alert: If error rate > 2x SLO for > 1 hour, P2 incident

---

## Recovery Time Objectives (RTO)

| Scenario | RTO |
|---|---|
| P1 (production down) | Restore within 1 hour |
| Database failure | Restore within 30 minutes |
| Failed deployment | Rollback within 10 minutes via Vercel |
| Secret rotation | Complete within 4 hours |

---

## Measurement

Currently measured via:
- Vercel deployment analytics (availability)
- Lighthouse CI (performance budgets — see `lighthouse-budget.json`)
- Structured error logs (error rate)

**Gap**: No real-time alerting configured. Add Vercel log drain + alert on error rate spikes.

---

## Lighthouse Performance Budgets

See `lighthouse-budget.json` and `lighthouserc.json` for enforced web performance thresholds.
CI fails if Performance, Accessibility, Best Practices, or SEO scores fall below thresholds.

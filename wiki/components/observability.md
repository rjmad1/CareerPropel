# Observability

## Purpose

Production observability for the CareerPropel runtime. Tracks execution throughput, latency percentiles, provider health, cost attribution, failure classification, and operational alerting.

## Responsibilities

- Maintain in-process metrics for queue, worker, and provider operations
- Compute p50/p95/p99 latency percentiles from rolling sample windows
- Score AI provider degradation based on failure rate, timeout rate, and latency
- Classify errors as retryable or non-retryable with typed failure categories
- Emit structured Pino log events at every execution phase
- Expose operational data via `/api/ops/*` endpoints

## Dependencies

- `pino` — structured JSON logging
- `src/lib/queue/queues` — queue metrics source
- `src/lib/realtime/` — SSE stream counters

## Public Interfaces

### Metrics (`metrics.ts`)

```typescript
// Queue
recordQueueMetric(queueName: string, durationMs: number, success: boolean): void

// Worker
recordWorkerExecution(workerName: string, durationMs: number, success: boolean): void
recordWorkerRetry(workerName: string): void

// Provider
recordProviderExecution(providerId: string, durationMs: number, success: boolean): void
recordProviderRetry(providerId: string): void
recordProviderCircuitOpen(providerId: string): void

// Concurrency gauge
incrementConcurrency(userId: string, agentType: string): void
decrementConcurrency(userId: string, agentType: string): void
getTotalActiveConcurrency(): number

// SSE gauge
incrementSseStreams(): void
decrementSseStreams(): void
recordSseDisconnect(): void
recordSseHeartbeatFailure(): void

// DLQ
updateDlqDepth(depth: number): void

// Snapshot
getMetricsSnapshot(): MetricsSnapshot
```

**MetricsSnapshot shape:**
```json
{
  "queues": {
    "agent-execution": {
      "count": 1420,
      "failures": 12,
      "retries": 34,
      "averageDurationMs": 8200,
      "maxDurationMs": 87000,
      "failureRate": 0.0085,
      "retryRate": 0.0239,
      "latency": { "p50": 6100, "p95": 24000, "p99": 61000 }
    }
  },
  "workers": { ... },
  "providers": {
    "anthropic": {
      "count": 1420,
      "circuitOpenCount": 0,
      "lastFailureAt": null,
      ...
    }
  },
  "concurrency": {
    "totalActive": 3,
    "perSlot": { "user1:resume-tailor": 1, "user2:interview-prep": 2 }
  },
  "sse": {
    "activeStreams": 7,
    "totalDisconnects": 142,
    "heartbeatFailures": 0
  },
  "dlq": { "depth": 0 },
  "snapshotAt": "2026-05-27T12:00:00Z"
}
```

### Provider Health (`provider-health.ts`)

```typescript
recordProviderObservation(
  providerId: string,
  durationMs: number,
  success: boolean,
  options?: { isTimeout?: boolean; isFallback?: boolean }
): void

getProviderHealthReport(providerId: string): ProviderHealthReport
getAllProviderHealthReports(): ProviderHealthReport[]
hasProviderDegradation(): boolean
```

**ProviderHealthReport:**
```typescript
{
  providerId: string
  status: 'healthy' | 'warning' | 'degraded' | 'critical'
  degradationScore: number  // 0–100
  recentObservations: number
  failureRate: number       // 0–1
  timeoutRate: number
  fallbackRate: number
  p95LatencyMs: number
  lastFailureAt?: string
  assessedAt: string
}
```

**Degradation score formula:**
```
score = min(100,
  failureRate  × 50 +
  timeoutRate  × 25 +
  fallbackRate × 15 +
  latencyPenalty        // up to 10 pts for p95 > 10s
)
```

**Score bands:**
- 0–20: healthy
- 21–50: warning
- 51–80: degraded
- 81–100: critical

Window: last 200 observations, scored within 10-minute recency gate.

### Failure Classification (`failure-classification.ts`)

```typescript
classifyError(error: unknown, context: object): {
  failureType: FailureType,
  retryable: boolean
}
```

**Failure types**: network, timeout, auth, rate_limit, validation, policy, hallucination, unknown

### Tracing (`tracing.ts`)

```typescript
startTraceSpan(name: string, attrs: Record<string, unknown>): TraceSpan

interface TraceSpan {
  addEvent(name: string, attrs?: Record<string, unknown>): void
  end(attrs?: Record<string, unknown>): void
}
```

Lightweight in-process span tracking. Not connected to external distributed tracing (Jaeger/Zipkin) in current implementation.

### Cost Analytics (`cost-analytics.ts`)

Aggregates token usage and USD cost per agent type. Exposed at `GET /api/ops/cost`.

### Alerts (`alerts.ts`)

Evaluates rule set against metrics snapshot. Returns active alerts at `GET /api/ops/alerts`.

## Ops API Endpoints

All on the web process:

| Endpoint | Returns |
|---|---|
| `GET /api/ops/metrics` | Full `getMetricsSnapshot()` |
| `GET /api/ops/queue` | BullMQ job counts (active, waiting, delayed, failed) |
| `GET /api/ops/providers` | `getAllProviderHealthReports()` |
| `GET /api/ops/dlq` | DLQ depth and sample jobs |
| `GET /api/ops/dlq/replay` | Trigger DLQ job replay |
| `GET /api/ops/cost` | Cost analytics by agent type |
| `GET /api/ops/alerts` | Active alert list |
| `GET /api/ops/executions` | Historical execution query |
| `GET /api/ops/runtime-metrics` | Runtime process metrics |

## Logging

All modules use `createLogger({ component: 'name' })` from `src/lib/logging/logger.ts`. Logs to stdout as JSON (Pino format).

Log levels: `debug`, `info`, `warn`, `error`.

Set `LOG_LEVEL` env var to adjust verbosity. Default: `info`.

Structured log fields on every execution event:
- `executionId`
- `userId`
- `agentType`
- `queueJobId`
- `correlationId`
- `requestId`

Audit logs written to the `AuditLog` DB table via `src/lib/logging/auditLog.ts`.

## Configuration

Metrics store is **in-process** (in-memory). Data is lost on process restart. For persistent metrics, the ops endpoints query BullMQ for queue counts and Prisma for execution history.

| Env Var | Default | Effect |
|---|---|---|
| `LOG_LEVEL` | `info` | Pino log verbosity |
| `QUEUE_METRICS_WINDOW_MS` | 3600000 | Metrics window (unused in current impl) |

## Failure Modes

| Failure | Effect |
|---|---|
| Metrics lost on restart | In-process only; historical data lives in DB |
| Provider health false positive | Score based on 10-min window; resolves automatically |
| High DLQ depth | Alert triggers; manual review needed |

## Security Considerations

- Ops endpoints do not require auth in current implementation
- **Validation required**: confirm `/api/ops/*` access control before production deployment

## Related Components

- [Agent System](agent-system.md)
- [Queue Infrastructure](queue-infrastructure.md)
- [Deployment Topology](../architecture/deployment-topology.md)

## Last Updated
2026-05-27

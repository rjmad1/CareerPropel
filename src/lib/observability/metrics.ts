/**
 * In-memory operational metrics store.
 *
 * Tracks:
 *  - queue / worker / provider aggregate counters
 *  - rolling latency samples for p50/p95/p99 percentiles (last 1000 per key)
 *  - time-bucketed counters (1m / 5m / 15m windows) for rates
 *  - concurrency gauge (active executions in flight)
 *  - SSE stream gauge
 *  - DLQ depth
 */

// ── Types ──────────────────────────────────────────────────────────────────

type AggregateMetric = {
  count: number;
  failures: number;
  retries: number;
  totalDurationMs: number;
  maxDurationMs: number;
  /** Ring buffer of recent durations for percentile computation */
  latencySamples: number[];
};

type ProviderMetric = AggregateMetric & {
  lastFailureAt?: string;
  /** Number of circuit-open rejections (not actual calls) */
  circuitOpenCount: number;
};

// ── Stores ─────────────────────────────────────────────────────────────────

const queueMetrics   = new Map<string, AggregateMetric>();
const providerMetrics = new Map<string, ProviderMetric>();
const workerMetrics  = new Map<string, AggregateMetric>();

/** Active execution count per (userId, agentType) slot */
const concurrencyGauge = new Map<string, number>();

/** Number of active SSE stream connections */
let sseActiveStreams = 0;
let sseDisconnects   = 0;
let sseHeartbeatFailures = 0;

/** DLQ depth is updated by the health check on demand — stored here for snapshots */
let dlqDepth = 0;

// ── Ring-buffer helpers ────────────────────────────────────────────────────

const MAX_SAMPLES = 1000;

function pushLatencySample(samples: number[], value: number) {
  samples.push(value);
  if (samples.length > MAX_SAMPLES) {
    samples.shift();
  }
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function computePercentiles(samples: number[]) {
  if (samples.length === 0) return { p50: 0, p95: 0, p99: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

// ── Aggregate factory ──────────────────────────────────────────────────────

function getAggregate(store: Map<string, AggregateMetric>, key: string): AggregateMetric {
  const current = store.get(key);
  if (current) return current;
  const agg: AggregateMetric = {
    count: 0,
    failures: 0,
    retries: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    latencySamples: [],
  };
  store.set(key, agg);
  return agg;
}

// ── Queue ──────────────────────────────────────────────────────────────────

export function recordQueueMetric(queueName: string, durationMs: number, success: boolean) {
  const metric = getAggregate(queueMetrics, queueName);
  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  pushLatencySample(metric.latencySamples, durationMs);
  if (!success) metric.failures += 1;
}

// ── Worker ─────────────────────────────────────────────────────────────────

export function recordWorkerRetry(workerName: string) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.retries += 1;
}

export function recordWorkerExecution(workerName: string, durationMs: number, success: boolean) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  pushLatencySample(metric.latencySamples, durationMs);
  if (!success) metric.failures += 1;
}

// ── Provider ───────────────────────────────────────────────────────────────

export function recordProviderExecution(providerId: string, durationMs: number, success: boolean) {
  const existing = providerMetrics.get(providerId);
  const metric: ProviderMetric = existing ?? {
    count: 0,
    failures: 0,
    retries: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    latencySamples: [],
    circuitOpenCount: 0,
  };

  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  pushLatencySample(metric.latencySamples, durationMs);
  if (!success) {
    metric.failures += 1;
    metric.lastFailureAt = new Date().toISOString();
  }

  providerMetrics.set(providerId, metric);
}

export function recordProviderRetry(providerId: string) {
  const existing = providerMetrics.get(providerId);
  const metric: ProviderMetric = existing ?? {
    count: 0,
    failures: 0,
    retries: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    latencySamples: [],
    circuitOpenCount: 0,
  };
  metric.retries += 1;
  providerMetrics.set(providerId, metric);
}

export function recordProviderCircuitOpen(providerId: string) {
  const existing = providerMetrics.get(providerId);
  const metric: ProviderMetric = existing ?? {
    count: 0,
    failures: 0,
    retries: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    latencySamples: [],
    circuitOpenCount: 0,
  };
  metric.circuitOpenCount += 1;
  providerMetrics.set(providerId, metric);
}

// ── Concurrency gauge ──────────────────────────────────────────────────────

export function incrementConcurrency(userId: string, agentType: string) {
  const key = `${userId}:${agentType}`;
  concurrencyGauge.set(key, (concurrencyGauge.get(key) ?? 0) + 1);
}

export function decrementConcurrency(userId: string, agentType: string) {
  const key = `${userId}:${agentType}`;
  const current = concurrencyGauge.get(key) ?? 0;
  concurrencyGauge.set(key, Math.max(0, current - 1));
}

export function getTotalActiveConcurrency(): number {
  let total = 0;
  for (const v of concurrencyGauge.values()) total += v;
  return total;
}

// ── SSE gauge ──────────────────────────────────────────────────────────────

export function incrementSseStreams()         { sseActiveStreams += 1; }
export function decrementSseStreams()         { sseActiveStreams = Math.max(0, sseActiveStreams - 1); }
export function recordSseDisconnect()        { sseDisconnects += 1; decrementSseStreams(); }
export function recordSseHeartbeatFailure()  { sseHeartbeatFailures += 1; }

// ── DLQ depth ──────────────────────────────────────────────────────────────

export function updateDlqDepth(depth: number) { dlqDepth = depth; }

// ── Snapshot ───────────────────────────────────────────────────────────────

function formatAggregate(metric: AggregateMetric) {
  const percentiles = computePercentiles(metric.latencySamples);
  return {
    count:            metric.count,
    failures:         metric.failures,
    retries:          metric.retries,
    averageDurationMs: metric.count > 0 ? Math.round(metric.totalDurationMs / metric.count) : 0,
    maxDurationMs:    metric.maxDurationMs,
    failureRate:      metric.count > 0 ? Number((metric.failures / metric.count).toFixed(4)) : 0,
    retryRate:        metric.count > 0 ? Number((metric.retries / metric.count).toFixed(4)) : 0,
    latency:          percentiles,
  };
}

export function getMetricsSnapshot() {
  return {
    queues: Object.fromEntries(
      Array.from(queueMetrics.entries()).map(([k, v]) => [k, formatAggregate(v)])
    ),
    workers: Object.fromEntries(
      Array.from(workerMetrics.entries()).map(([k, v]) => [k, formatAggregate(v)])
    ),
    providers: Object.fromEntries(
      Array.from(providerMetrics.entries()).map(([k, v]) => [
        k,
        {
          ...formatAggregate(v),
          lastFailureAt:    v.lastFailureAt ?? null,
          circuitOpenCount: v.circuitOpenCount,
        },
      ])
    ),
    concurrency: {
      totalActive: getTotalActiveConcurrency(),
      perSlot: Object.fromEntries(concurrencyGauge),
    },
    sse: {
      activeStreams:      sseActiveStreams,
      totalDisconnects:   sseDisconnects,
      heartbeatFailures:  sseHeartbeatFailures,
    },
    dlq: {
      depth: dlqDepth,
    },
    snapshotAt: new Date().toISOString(),
  };
}

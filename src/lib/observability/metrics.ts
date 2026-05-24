type AggregateMetric = {
  count: number;
  failures: number;
  retries: number;
  totalDurationMs: number;
  maxDurationMs: number;
};

type ProviderMetric = AggregateMetric & {
  lastFailureAt?: string;
};

const queueMetrics = new Map<string, AggregateMetric>();
const providerMetrics = new Map<string, ProviderMetric>();
const workerMetrics = new Map<string, AggregateMetric>();

function getAggregate(store: Map<string, AggregateMetric>, key: string): AggregateMetric {
  const current = store.get(key);
  if (current) {
    return current;
  }

  const aggregate: AggregateMetric = {
    count: 0,
    failures: 0,
    retries: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
  };

  store.set(key, aggregate);
  return aggregate;
}

export function recordQueueMetric(queueName: string, durationMs: number, success: boolean) {
  const metric = getAggregate(queueMetrics, queueName);
  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  if (!success) {
    metric.failures += 1;
  }
}

export function recordWorkerRetry(workerName: string) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.retries += 1;
}

export function recordWorkerExecution(workerName: string, durationMs: number, success: boolean) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  if (!success) {
    metric.failures += 1;
  }
}

export function recordProviderExecution(providerId: string, durationMs: number, success: boolean) {
  const metric =
    providerMetrics.get(providerId) ||
    {
      count: 0,
      failures: 0,
      retries: 0,
      totalDurationMs: 0,
      maxDurationMs: 0,
    };

  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  if (!success) {
    metric.failures += 1;
    metric.lastFailureAt = new Date().toISOString();
  }

  providerMetrics.set(providerId, metric);
}

export function recordProviderRetry(providerId: string) {
  const metric =
    providerMetrics.get(providerId) ||
    {
      count: 0,
      failures: 0,
      retries: 0,
      totalDurationMs: 0,
      maxDurationMs: 0,
    };

  metric.retries += 1;
  providerMetrics.set(providerId, metric);
}

function formatAggregate(metric: AggregateMetric) {
  return {
    count: metric.count,
    failures: metric.failures,
    retries: metric.retries,
    averageDurationMs: metric.count > 0 ? Math.round(metric.totalDurationMs / metric.count) : 0,
    maxDurationMs: metric.maxDurationMs,
    failureRate: metric.count > 0 ? Number((metric.failures / metric.count).toFixed(4)) : 0,
  };
}

export function getMetricsSnapshot() {
  return {
    queues: Object.fromEntries(
      Array.from(queueMetrics.entries()).map(([key, value]) => [key, formatAggregate(value)])
    ),
    workers: Object.fromEntries(
      Array.from(workerMetrics.entries()).map(([key, value]) => [key, formatAggregate(value)])
    ),
    providers: Object.fromEntries(
      Array.from(providerMetrics.entries()).map(([key, value]) => [
        key,
        {
          ...formatAggregate(value),
          lastFailureAt: value.lastFailureAt || null,
        },
      ])
    ),
  };
}

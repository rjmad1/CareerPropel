/**
 * Operational alerting — threshold-based signal generation.
 *
 * Does NOT send notifications (no vendor lock-in yet).
 * Returns a structured alert list that ops endpoints and monitors consume.
 *
 * Alert severity: 'critical' | 'warning' | 'info'
 */

import { getMetricsSnapshot } from '@/lib/observability/metrics';
import { getAllProviderHealthReports } from '@/lib/observability/provider-health';
import { getRuntimeSnapshot } from '@/lib/observability/runtime-metrics';
import { getDeadLetterQueue, getExecutionQueue } from '@/lib/queue/queues';
import { runtimeSettings } from '@/lib/runtime/settings';

// ── Types ──────────────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id:        string;
  severity:  AlertSeverity;
  domain:    'queue' | 'provider' | 'worker' | 'runtime' | 'cost';
  title:     string;
  detail:    string;
  value?:    number;
  threshold?: number;
  detectedAt: string;
}

// ── Thresholds (can be driven by env in the future) ────────────────────────

const THRESHOLDS = {
  dlqDepthWarning:          5,
  dlqDepthCritical:         20,
  workerFailureRateWarning:  0.10,
  workerFailureRateCritical: 0.25,
  providerDegradedScore:    50,
  providerCriticalScore:    80,
  queueWaitingWarning:      50,
  queueWaitingCritical:     200,
  memoryHeapWarningMb:      512,
  memoryHeapCriticalMb:     900,
  eventLoopLagWarningMs:    100,
  eventLoopLagCriticalMs:   500,
  redisReconnectsWarning:   3,
};

// ── Evaluators ─────────────────────────────────────────────────────────────

async function queueAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const [counts, dlqCounts, activeJobs] = await Promise.all([
    getExecutionQueue().getJobCounts('waiting', 'active', 'failed'),
    getDeadLetterQueue().getJobCounts('waiting', 'active', 'failed'),
    getExecutionQueue().getJobs(['active'], 0, 100),
  ]);

  const dlqTotal = (dlqCounts.waiting ?? 0) + (dlqCounts.active ?? 0) + (dlqCounts.failed ?? 0);

  if (dlqTotal >= THRESHOLDS.dlqDepthCritical) {
    alerts.push(alert('critical', 'queue', 'DLQ critical depth',
      `Dead-letter queue has ${dlqTotal} jobs — immediate attention required`,
      dlqTotal, THRESHOLDS.dlqDepthCritical));
  } else if (dlqTotal >= THRESHOLDS.dlqDepthWarning) {
    alerts.push(alert('warning', 'queue', 'DLQ accumulating',
      `Dead-letter queue has ${dlqTotal} jobs`,
      dlqTotal, THRESHOLDS.dlqDepthWarning));
  }

  const waiting = counts.waiting ?? 0;
  if (waiting >= THRESHOLDS.queueWaitingCritical) {
    alerts.push(alert('critical', 'queue', 'Queue starvation',
      `${waiting} executions waiting — workers may be saturated or stalled`,
      waiting, THRESHOLDS.queueWaitingCritical));
  } else if (waiting >= THRESHOLDS.queueWaitingWarning) {
    alerts.push(alert('warning', 'queue', 'Queue backlog building',
      `${waiting} executions waiting`,
      waiting, THRESHOLDS.queueWaitingWarning));
  }

  // Stuck job detection: active longer than 2× configured timeout
  const stuckThresholdMs = runtimeSettings.executionTimeoutMs * 2;
  const now = Date.now();
  const stuckCount = activeJobs.filter(
    (j) => now - (j.processedOn ?? j.timestamp) > stuckThresholdMs
  ).length;

  if (stuckCount > 0) {
    alerts.push(alert('critical', 'queue', 'Stuck executions detected',
      `${stuckCount} active execution(s) have exceeded ${stuckThresholdMs / 1000}s — potential worker deadlock`,
      stuckCount));
  }

  return alerts;
}

function providerAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const reports = getAllProviderHealthReports();

  for (const report of reports) {
    if (report.degradationScore >= THRESHOLDS.providerCriticalScore) {
      alerts.push(alert('critical', 'provider',
        `Provider "${report.providerId}" critical`,
        `Degradation score ${report.degradationScore}/100 — failure rate ${(report.failureRate * 100).toFixed(1)}%, p95 latency ${report.p95LatencyMs}ms`,
        report.degradationScore, THRESHOLDS.providerCriticalScore));
    } else if (report.degradationScore >= THRESHOLDS.providerDegradedScore) {
      alerts.push(alert('warning', 'provider',
        `Provider "${report.providerId}" degraded`,
        `Degradation score ${report.degradationScore}/100`,
        report.degradationScore, THRESHOLDS.providerDegradedScore));
    }
  }

  return alerts;
}

function workerAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const snapshot = getMetricsSnapshot();

  for (const [name, m] of Object.entries(snapshot.workers)) {
    if (m.count < 5) continue; // not enough samples
    if (m.failureRate >= THRESHOLDS.workerFailureRateCritical) {
      alerts.push(alert('critical', 'worker',
        `Worker "${name}" high failure rate`,
        `Failure rate ${(m.failureRate * 100).toFixed(1)}% over ${m.count} executions`,
        m.failureRate, THRESHOLDS.workerFailureRateCritical));
    } else if (m.failureRate >= THRESHOLDS.workerFailureRateWarning) {
      alerts.push(alert('warning', 'worker',
        `Worker "${name}" elevated failure rate`,
        `Failure rate ${(m.failureRate * 100).toFixed(1)}%`,
        m.failureRate, THRESHOLDS.workerFailureRateWarning));
    }
  }

  return alerts;
}

function runtimeAlerts(): Alert[] {
  const alerts: Alert[] = [];
  const runtime = getRuntimeSnapshot();

  if (runtime.memory.heapUsedMb >= THRESHOLDS.memoryHeapCriticalMb) {
    alerts.push(alert('critical', 'runtime', 'Heap memory critical',
      `Heap used ${runtime.memory.heapUsedMb} MB`,
      runtime.memory.heapUsedMb, THRESHOLDS.memoryHeapCriticalMb));
  } else if (runtime.memory.heapUsedMb >= THRESHOLDS.memoryHeapWarningMb) {
    alerts.push(alert('warning', 'runtime', 'Heap memory elevated',
      `Heap used ${runtime.memory.heapUsedMb} MB`,
      runtime.memory.heapUsedMb, THRESHOLDS.memoryHeapWarningMb));
  }

  if (runtime.eventLoopLagMs >= THRESHOLDS.eventLoopLagCriticalMs) {
    alerts.push(alert('critical', 'runtime', 'Event loop severely lagging',
      `Event loop lag ${runtime.eventLoopLagMs}ms — process may be blocked`,
      runtime.eventLoopLagMs, THRESHOLDS.eventLoopLagCriticalMs));
  } else if (runtime.eventLoopLagMs >= THRESHOLDS.eventLoopLagWarningMs) {
    alerts.push(alert('warning', 'runtime', 'Event loop lag detected',
      `Event loop lag ${runtime.eventLoopLagMs}ms`,
      runtime.eventLoopLagMs, THRESHOLDS.eventLoopLagWarningMs));
  }

  if (runtime.redisReconnects >= THRESHOLDS.redisReconnectsWarning) {
    alerts.push(alert('warning', 'runtime', 'Redis reconnect instability',
      `${runtime.redisReconnects} reconnects since process start`,
      runtime.redisReconnects, THRESHOLDS.redisReconnectsWarning));
  }

  return alerts;
}

// ── Public ─────────────────────────────────────────────────────────────────

export interface AlertsSnapshot {
  critical: Alert[];
  warning:  Alert[];
  info:     Alert[];
  all:      Alert[];
  counts:   { critical: number; warning: number; info: number; total: number };
  evaluatedAt: string;
}

export async function evaluateAlerts(): Promise<AlertsSnapshot> {
  const [queue, provider, worker, runtime] = await Promise.all([
    queueAlerts(),
    Promise.resolve(providerAlerts()),
    Promise.resolve(workerAlerts()),
    Promise.resolve(runtimeAlerts()),
  ]);

  const all = [...queue, ...provider, ...worker, ...runtime];
  const critical = all.filter((a) => a.severity === 'critical');
  const warning  = all.filter((a) => a.severity === 'warning');
  const info     = all.filter((a) => a.severity === 'info');

  return {
    critical,
    warning,
    info,
    all,
    counts: {
      critical: critical.length,
      warning:  warning.length,
      info:     info.length,
      total:    all.length,
    },
    evaluatedAt: new Date().toISOString(),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

let _alertSeq = 0;
function alert(
  severity: AlertSeverity,
  domain: Alert['domain'],
  title: string,
  detail: string,
  value?: number,
  threshold?: number
): Alert {
  return {
    id:         `alert-${++_alertSeq}`,
    severity,
    domain,
    title,
    detail,
    value,
    threshold,
    detectedAt: new Date().toISOString(),
  };
}

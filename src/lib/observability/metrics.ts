import { prisma } from '@/lib/db';
import * as otel from '@/platform/telemetry/metrics';

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

/** Product analytics funnel counters */
let onboardingCompletions = 0;
let resumeUploadSuccesses = 0;
let resumeUploadFailures = 0;
let aiExtractionSuccesses = 0;
let aiExtractionFallbackDegraded = 0;

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

  otel.queueLatency.record(durationMs, { queueName, success: String(success) });
}

// ── Worker ─────────────────────────────────────────────────────────────────

export function recordWorkerRetry(workerName: string) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.retries += 1;

  otel.workerRetries.add(1, { workerName });
}

export function recordWorkerExecution(workerName: string, durationMs: number, success: boolean) {
  const metric = getAggregate(workerMetrics, workerName);
  metric.count += 1;
  metric.totalDurationMs += durationMs;
  metric.maxDurationMs = Math.max(metric.maxDurationMs, durationMs);
  pushLatencySample(metric.latencySamples, durationMs);
  if (!success) metric.failures += 1;

  otel.workerLatency.record(durationMs, { workerName, success: String(success) });
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

  otel.providerLatency.record(durationMs, { providerId, success: String(success) });
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

  otel.providerRetries.add(1, { providerId });
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

  otel.providerCircuitOpens.add(1, { providerId });
}

// ── Concurrency gauge ──────────────────────────────────────────────────────

export function incrementConcurrency(userId: string, agentType: string) {
  const key = `${userId}:${agentType}`;
  concurrencyGauge.set(key, (concurrencyGauge.get(key) ?? 0) + 1);

  otel.activeConcurrency.add(1, { userId, agentType });
}

export function decrementConcurrency(userId: string, agentType: string) {
  const key = `${userId}:${agentType}`;
  const current = concurrencyGauge.get(key) ?? 0;
  concurrencyGauge.set(key, Math.max(0, current - 1));

  otel.activeConcurrency.add(-1, { userId, agentType });
}

export function getTotalActiveConcurrency(): number {
  let total = 0;
  for (const v of concurrencyGauge.values()) total += v;
  return total;
}

// ── SSE gauge ──────────────────────────────────────────────────────────────

export function incrementSseStreams() {
  sseActiveStreams += 1;
  otel.sseActiveStreams.add(1);
}

export function decrementSseStreams() {
  sseActiveStreams = Math.max(0, sseActiveStreams - 1);
  otel.sseActiveStreams.add(-1);
}

export function recordSseDisconnect() {
  sseDisconnects += 1;
  decrementSseStreams();
  otel.sseDisconnects.add(1);
}

export function recordSseHeartbeatFailure() {
  sseHeartbeatFailures += 1;
  otel.sseHeartbeatFailures.add(1);
}

// ── DLQ depth ──────────────────────────────────────────────────────────────

export function updateDlqDepth(depth: number) {
  const delta = depth - dlqDepth;
  dlqDepth = depth;
  otel.dlqDepth.add(delta);
}

// ── Product Funnel Analytics ───────────────────────────────────────────────

export function recordOnboardingCompletion() {
  onboardingCompletions += 1;
  otel.onboardingCompletions.add(1);
}

export function recordResumeUpload(success: boolean) {
  if (success) resumeUploadSuccesses += 1;
  else resumeUploadFailures += 1;

  otel.resumeUploads.add(1, { success: String(success) });
}

export function recordAiExtraction(source: 'ai' | 'fallback') {
  if (source === 'ai') aiExtractionSuccesses += 1;
  else aiExtractionFallbackDegraded += 1;

  otel.aiExtractions.add(1, { source });
}

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

export async function getMetricsSnapshot() {
  let resumeUploads = 0;
  let resumeParses = 0;
  let profilesCreated = 0;
  let profilesCompleted = 0;

  let jobsImported = 0;
  let matchesGenerated = 0;
  let resumesTailored = 0;
  let applicationsExported = 0;

  let prepsGenerated = 0;
  let interviewQuestionsCompleted = 0;
  let interviewSessionsCompleted = 0;

  let achievementsCaptured = 0;
  let appraisalReviewsGenerated = 0;
  let appraisalReviewsExported = 0;

  try {
    const funnelCounts = await prisma.productFunnelMetric.groupBy({
      by: ['funnel', 'step', 'status'],
      _count: {
        id: true,
      },
    });

    for (const group of funnelCounts) {
      const count = group._count.id;
      if (group.funnel === 'resume') {
        if (group.step === 'upload' && group.status === 'completed') resumeUploads += count;
        else if (group.step === 'parse' && group.status === 'completed') resumeParses += count;
        else if (group.step === 'profile') {
          if (group.status === 'started') profilesCreated += count;
          else if (group.status === 'completed') profilesCompleted += count;
        }
      } else if (group.funnel === 'job') {
        if (group.step === 'import' && group.status === 'completed') jobsImported += count;
        else if (group.step === 'match' && group.status === 'completed') matchesGenerated += count;
        else if (group.step === 'tailor' && group.status === 'completed') resumesTailored += count;
        else if (group.step === 'export' && group.status === 'completed') applicationsExported += count;
      } else if (group.funnel === 'interview') {
        if (group.step === 'generate' && group.status === 'completed') prepsGenerated += count;
        else if (group.step === 'question' && group.status === 'completed') interviewQuestionsCompleted += count;
        else if (group.step === 'session' && group.status === 'completed') interviewSessionsCompleted += count;
      } else if (group.funnel === 'appraisal') {
        if (group.step === 'capture' && group.status === 'completed') achievementsCaptured += count;
        else if (group.step === 'generate' && group.status === 'completed') appraisalReviewsGenerated += count;
        else if (group.step === 'export' && group.status === 'completed') appraisalReviewsExported += count;
      }
    }
  } catch (error) {
    console.error('[getMetricsSnapshot] Failed to aggregate funnel stats:', error);
  }

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
    productAnalytics: {
      onboardingCompletions,
      resumeUpload: {
        success: resumeUploadSuccesses,
        failure: resumeUploadFailures,
        rate: (resumeUploadSuccesses + resumeUploadFailures) > 0 
          ? Number((resumeUploadSuccesses / (resumeUploadSuccesses + resumeUploadFailures)).toFixed(4)) 
          : 1.0
      },
      aiExtraction: {
        success: aiExtractionSuccesses,
        fallbackDegraded: aiExtractionFallbackDegraded,
        fallbackRate: (aiExtractionSuccesses + aiExtractionFallbackDegraded) > 0
          ? Number((aiExtractionFallbackDegraded / (aiExtractionSuccesses + aiExtractionFallbackDegraded)).toFixed(4))
          : 0.0
      },
      funnels: {
        resume: {
          uploaded: resumeUploads,
          parsed: resumeParses,
          profileCreated: profilesCreated,
          profileCompleted: profilesCompleted,
        },
        job: {
          imported: jobsImported,
          matchGenerated: matchesGenerated,
          resumeTailored: resumesTailored,
          applicationExported: applicationsExported,
        },
        interview: {
          prepGenerated: prepsGenerated,
          questionsCompleted: interviewQuestionsCompleted,
          sessionCompleted: interviewSessionsCompleted,
        },
        appraisal: {
          achievementCaptured: achievementsCaptured,
          reviewGenerated: appraisalReviewsGenerated,
          reviewExported: appraisalReviewsExported,
        }
      }
    },
    snapshotAt: new Date().toISOString(),
  };
}

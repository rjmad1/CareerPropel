/**
 * Provider health intelligence layer.
 *
 * Maintains a sliding window of provider observations (last N per provider)
 * and derives a degradation score so the platform can detect:
 *   "Claude is degraded" before users report "Interview prep is slow."
 *
 * Degradation score 0–100 (higher = more degraded):
 *   - 0–20  : healthy
 *   - 21–50 : warning
 *   - 51–80 : degraded
 *   - 81–100: critical
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type ProviderHealthStatus = 'healthy' | 'warning' | 'degraded' | 'critical';

interface Observation {
  success: boolean;
  durationMs: number;
  isTimeout: boolean;
  isFallback: boolean;
  timestamp: number; // Date.now()
}

interface ProviderWindow {
  providerId: string;
  observations: Observation[];
  /** Rolling p95 latency derived on each record */
  p95Latency: number;
  /** Fallback count within the window */
  fallbackCount: number;
}

// ── Config ──────────────────────────────────────────────────────────────────

const WINDOW_SIZE     = 200;  // observations kept per provider
const WINDOW_DURATION = 10 * 60 * 1000; // 10-minute recency gate for score computation

// ── Store ──────────────────────────────────────────────────────────────────

const windows = new Map<string, ProviderWindow>();

// ── Write ──────────────────────────────────────────────────────────────────

export function recordProviderObservation(
  providerId: string,
  durationMs: number,
  success: boolean,
  options: { isTimeout?: boolean; isFallback?: boolean } = {}
) {
  const window = getWindow(providerId);

  const observation: Observation = {
    success,
    durationMs,
    isTimeout:  options.isTimeout  ?? (!success && durationMs > 5000),
    isFallback: options.isFallback ?? false,
    timestamp:  Date.now(),
  };

  window.observations.push(observation);
  if (window.observations.length > WINDOW_SIZE) {
    window.observations.shift();
  }

  // Update derived fields
  const latencies = window.observations.map((o) => o.durationMs).sort((a, b) => a - b);
  const p95idx    = Math.ceil(0.95 * latencies.length) - 1;
  window.p95Latency  = latencies[Math.max(0, p95idx)] ?? 0;
  window.fallbackCount = window.observations.filter((o) => o.isFallback).length;
}

function getWindow(providerId: string): ProviderWindow {
  const existing = windows.get(providerId);
  if (existing) return existing;
  const w: ProviderWindow = { providerId, observations: [], p95Latency: 0, fallbackCount: 0 };
  windows.set(providerId, w);
  return w;
}

// ── Read / scoring ─────────────────────────────────────────────────────────

export interface ProviderHealthReport {
  providerId:          string;
  status:              ProviderHealthStatus;
  degradationScore:    number; // 0–100
  recentObservations:  number;
  failureRate:         number; // 0–1 over window
  timeoutRate:         number;
  fallbackRate:        number;
  p95LatencyMs:        number;
  lastFailureAt?:      string;
  assessedAt:          string;
}

export function getProviderHealthReport(providerId: string): ProviderHealthReport {
  const window = windows.get(providerId);
  const now    = Date.now();

  if (!window || window.observations.length === 0) {
    return {
      providerId,
      status:             'healthy',
      degradationScore:   0,
      recentObservations: 0,
      failureRate:        0,
      timeoutRate:        0,
      fallbackRate:       0,
      p95LatencyMs:       0,
      assessedAt:         new Date(now).toISOString(),
    };
  }

  // Only score observations within WINDOW_DURATION
  const recent = window.observations.filter((o) => now - o.timestamp <= WINDOW_DURATION);
  const n       = recent.length;

  if (n === 0) {
    return {
      providerId,
      status:             'healthy',
      degradationScore:   0,
      recentObservations: 0,
      failureRate:        0,
      timeoutRate:        0,
      fallbackRate:       0,
      p95LatencyMs:       window.p95Latency,
      assessedAt:         new Date(now).toISOString(),
    };
  }

  const failures   = recent.filter((o) => !o.success).length;
  const timeouts   = recent.filter((o) => o.isTimeout).length;
  const fallbacks  = recent.filter((o) => o.isFallback).length;
  const failureRate  = failures / n;
  const timeoutRate  = timeouts / n;
  const fallbackRate = fallbacks / n;

  // p95 from recent window
  const sortedLatencies = recent.map((o) => o.durationMs).sort((a, b) => a - b);
  const p95idx          = Math.ceil(0.95 * sortedLatencies.length) - 1;
  const p95LatencyMs    = sortedLatencies[Math.max(0, p95idx)] ?? 0;

  // Degradation score: weighted sum capped at 100
  //  failure rate contributes up to 50 pts
  //  timeout rate contributes up to 25 pts
  //  fallback rate contributes up to 15 pts
  //  p95 latency > 10s adds up to 10 pts
  const latencyPenalty = Math.min(10, Math.max(0, (p95LatencyMs - 10_000) / 2_000));
  const score = Math.min(
    100,
    failureRate  * 50 +
    timeoutRate  * 25 +
    fallbackRate * 15 +
    latencyPenalty
  );

  const status = scoreToStatus(score);
  const lastFailure = recent.filter((o) => !o.success).pop();

  return {
    providerId,
    status,
    degradationScore:   Math.round(score),
    recentObservations: n,
    failureRate:        Number(failureRate.toFixed(4)),
    timeoutRate:        Number(timeoutRate.toFixed(4)),
    fallbackRate:       Number(fallbackRate.toFixed(4)),
    p95LatencyMs,
    lastFailureAt:      lastFailure
      ? new Date(lastFailure.timestamp).toISOString()
      : undefined,
    assessedAt: new Date(now).toISOString(),
  };
}

function scoreToStatus(score: number): ProviderHealthStatus {
  if (score <= 20)  return 'healthy';
  if (score <= 50)  return 'warning';
  if (score <= 80)  return 'degraded';
  return 'critical';
}

export function getAllProviderHealthReports(): ProviderHealthReport[] {
  return Array.from(windows.keys()).map(getProviderHealthReport);
}

/** Returns true if any provider is degraded or critical */
export function hasProviderDegradation(): boolean {
  return getAllProviderHealthReports().some(
    (r) => r.status === 'degraded' || r.status === 'critical'
  );
}

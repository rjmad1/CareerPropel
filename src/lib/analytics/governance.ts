/**
 * Analytics Governance
 *
 * Confidence scoring, estimation labeling, stale-data detection, and metric lineage.
 * Every computed metric should flow through these helpers so that:
 *   - users can distinguish verified vs. inferred vs. estimated data
 *   - confidence is proportional to sample size and recency
 *   - limitations are surfaced transparently
 */

import type { ConfidenceLevel, DataSourceType, MetricMetadata, ScoredMetric } from './types';

// ── Confidence Scoring ────────────────────────────────────────────────────────

/** Map sample size to a confidence tier. */
export function sampleConfidence(n: number): ConfidenceLevel {
  if (n >= 10) return 'high';
  if (n >= 3) return 'medium';
  return 'low';
}

/** Aggregate multiple confidence levels into a single level (pessimistic average). */
export function aggregateConfidence(levels: ConfidenceLevel[]): ConfidenceLevel {
  if (levels.length === 0) return 'low';
  const score = levels.reduce(
    (s, l) => s + (l === 'high' ? 2 : l === 'medium' ? 1 : 0),
    0,
  );
  const avg = score / levels.length;
  if (avg >= 1.5) return 'high';
  if (avg >= 0.75) return 'medium';
  return 'low';
}

// ── ScoredMetric Constructor ──────────────────────────────────────────────────

/** Wrap any value with governance metadata. */
export function scored<T>(
  value: T,
  confidence: ConfidenceLevel,
  source: DataSourceType,
  opts: Partial<Omit<MetricMetadata, 'confidence' | 'source'>> = {},
): ScoredMetric<T> {
  return { value, meta: { confidence, source, ...opts } };
}

// ── Compensation Percentile Estimation ───────────────────────────────────────

/**
 * Rough heuristic percentile estimate from a salary figure.
 *
 * ⚠️  This is NOT verified labor-market data.
 * Uses broad USD compensation bands only. Always labeled 'estimated'.
 * Direct users to Levels.fyi / Glassdoor / Blind for verified benchmarks.
 */
export function estimatePercentile(salary: number): ScoredMetric<number | null> {
  const bands: Array<{ max: number; p: number }> = [
    { max: 70_000, p: 15 },
    { max: 90_000, p: 25 },
    { max: 110_000, p: 35 },
    { max: 130_000, p: 45 },
    { max: 150_000, p: 55 },
    { max: 175_000, p: 65 },
    { max: 200_000, p: 75 },
    { max: 230_000, p: 82 },
    { max: 270_000, p: 88 },
    { max: 320_000, p: 93 },
    { max: Infinity, p: 97 },
  ];
  const band = bands.find((b) => salary <= b.max);
  return scored<number | null>(
    band?.p ?? null,
    'low',
    'estimated',
    {
      note:
        'Rough percentile estimate from internal heuristic bands — NOT verified market data. ' +
        'For accurate benchmarks use Levels.fyi, Glassdoor, or Blind.',
    },
  );
}

// ── Data Freshness ────────────────────────────────────────────────────────────

export type FreshnessLabel = 'fresh' | 'aging' | 'stale';

export interface FreshnessResult {
  staleDays: number;
  isStale: boolean;
  freshness: FreshnessLabel;
}

/** Return how stale a dataset is based on its most-recent activity timestamp. */
export function dataFreshness(lastActivityAt: Date | null): FreshnessResult {
  if (!lastActivityAt) {
    return { staleDays: 999, isStale: true, freshness: 'stale' };
  }
  const staleDays = Math.floor((Date.now() - lastActivityAt.getTime()) / 86_400_000);
  const freshness: FreshnessLabel =
    staleDays <= 7 ? 'fresh' : staleDays <= 30 ? 'aging' : 'stale';
  return { staleDays, isStale: staleDays > 30, freshness };
}

// ── Metric Lineage ────────────────────────────────────────────────────────────

/** Records what data fed a computed metric — for transparency and auditability. */
export interface MetricLineage {
  metric: string;
  sources: string[]; // e.g. ["Job.stage", "JobActivity.stage_changed"]
  computedAt: string; // ISO timestamp
  sampleSize: number;
  limitations: string[];
}

export function lineage(
  metric: string,
  sources: string[],
  sampleSize: number,
  limitations: string[] = [],
): MetricLineage {
  return {
    metric,
    sources,
    computedAt: new Date().toISOString(),
    sampleSize,
    limitations,
  };
}

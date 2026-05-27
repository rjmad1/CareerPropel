/**
 * GET /api/ops/providers
 * Provider health intelligence dashboard.
 *
 * Returns degradation scores, latency percentiles, failure/timeout/fallback rates
 * for all observed LLM providers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSnapshot } from '@/lib/observability/metrics';
import { getAllProviderHealthReports, hasProviderDegradation } from '@/lib/observability/provider-health';

export async function GET(_req: NextRequest) {
  const reports   = getAllProviderHealthReports();
  const snapshot  = getMetricsSnapshot();
  const degraded  = hasProviderDegradation();

  // Merge health-window report with aggregate counters from metrics store
  const merged = reports.map((report) => ({
    ...report,
    aggregates: snapshot.providers[report.providerId] ?? null,
  }));

  return NextResponse.json({
    overallStatus: degraded ? 'degraded' : 'healthy',
    providers:     merged,
    timestamp:     new Date().toISOString(),
  });
}

/**
 * GET /api/ops/alerts
 * Evaluate and return active operational alerts.
 *
 * Covers: queue stalls, DLQ growth, provider degradation,
 * worker instability, memory pressure, event loop lag.
 */

import { NextRequest, NextResponse } from 'next/server';
import { evaluateAlerts } from '@/lib/observability/alerts';
import { startEventLoopSampler } from '@/lib/observability/runtime-metrics';

startEventLoopSampler();

export async function GET(_req: NextRequest) {
  const snapshot = await evaluateAlerts();

  const status =
    snapshot.counts.critical > 0 ? 503 :
    snapshot.counts.warning  > 0 ? 200 :
    200;

  return NextResponse.json(snapshot, { status });
}

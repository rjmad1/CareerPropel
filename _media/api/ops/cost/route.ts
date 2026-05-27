/**
 * GET /api/ops/cost
 * Cost governance dashboard.
 *
 * Query params:
 *  - days: lookback window in days (default 7, max 90)
 *
 * Returns per-agent and per-user token usage + estimated USD cost,
 * top spenders, and anomaly flags.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCostSnapshot } from '@/lib/observability/cost-analytics';

export async function GET(req: NextRequest) {
  const raw  = req.nextUrl.searchParams.get('days');
  const days = Math.min(90, Math.max(1, parseInt(raw ?? '7', 10)));

  const snapshot = await getCostSnapshot(days);
  return NextResponse.json(snapshot);
}

/**
 * GET /api/ops/metrics
 * Full operational metrics snapshot: queues, workers, providers, concurrency, SSE, DLQ.
 * Intended for ops dashboards and automated monitors.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetricsSnapshot, updateDlqDepth } from '@/lib/observability/metrics';
import { getRuntimeSnapshot, startEventLoopSampler } from '@/lib/observability/runtime-metrics';
import { getDeadLetterQueue } from '@/lib/queue/queues';

startEventLoopSampler();

export async function GET(_req: NextRequest) {
  // Refresh DLQ depth on each request
  try {
    const dlqCount = await getDeadLetterQueue().getJobCounts('waiting', 'active', 'failed');
    updateDlqDepth((dlqCount.waiting ?? 0) + (dlqCount.active ?? 0) + (dlqCount.failed ?? 0));
  } catch {
    // Non-fatal — DLQ may be unavailable during startup
  }

  return NextResponse.json({
    metrics:  await getMetricsSnapshot(),
    runtime:  getRuntimeSnapshot(),
  });
}

import { NextResponse } from 'next/server';
import { getAggregateHealth } from '@/lib/health/checks';
import { log } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

// Readiness — all subsystems healthy enough to accept traffic.
export async function GET() {
  const health = await getAggregateHealth();

  const httpStatus = health.overall === 'unavailable' ? 503 : 200;

  if (health.overall === 'healthy') {
    log.info(health, 'Readiness: healthy');
  } else if (health.overall === 'degraded') {
    log.warn(health, 'Readiness: degraded');
  } else {
    log.error(health, 'Readiness: unavailable');
  }

  return NextResponse.json(health, { status: httpStatus });
}

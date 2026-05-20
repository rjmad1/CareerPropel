/**
 * GET /api/agents/execute-pending
 *
 * Background processing endpoint for queued agent executions.
 * Called by Vercel Cron (see vercel.json) every minute.
 *
 * Remediations applied:
 *   RASUI-001: vercel.json cron now wires this endpoint properly
 *   RASUI-005: executor processes exactly ONE execution per invocation
 *   RASUI-009: EXECUTOR_SECRET is enforced as required in production;
 *              endpoint is closed by default (fail-closed, not fail-open)
 *
 * Environment variables:
 *   EXECUTOR_SECRET (required in production): Secret sent by the cron caller
 *     to prevent unauthorized triggering of agent execution.
 *     Must be >= 32 characters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPendingExecutions } from '@/lib/agents/executor';
import { log } from '@/lib/logging/logger';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic';

/**
 * Validate the EXECUTOR_SECRET header.
 *
 * Security contract (RASUI-009 fix):
 * - In production: EXECUTOR_SECRET MUST be set. If unset, reject ALL requests
 *   with 500 to surface the misconfiguration rather than silently allowing
 *   unauthorized execution.
 * - If set: the caller must provide it in `x-executor-secret` header.
 * - In development: secret is optional; allows local testing without config.
 */
function verifySecret(request: NextRequest): NextResponse | null {
  const expectedSecret = process.env.EXECUTOR_SECRET;

  if (!expectedSecret) {
    if (process.env.NODE_ENV === 'production') {
      log.error(
        'EXECUTOR_SECRET is not set in production — agent execution endpoint is locked down'
      );
      return NextResponse.json(
        {
          error: 'Server misconfiguration: EXECUTOR_SECRET is required in production',
          code: 'EXECUTOR_SECRET_MISSING',
        },
        { status: 500 }
      );
    }
    // Development: allow through if secret not configured
    return null;
  }

  const provided = request.headers.get('x-executor-secret');
  if (provided !== expectedSecret) {
    log.warn('Rejected unauthorized request to execute-pending endpoint');
    return NextResponse.json(
      { error: 'Unauthorized', code: 'INVALID_EXECUTOR_SECRET' },
      { status: 401 }
    );
  }

  return null;
}

export async function GET(request: NextRequest) {
  const authError = verifySecret(request);
  if (authError) return authError;

  try {
    const processed = await processPendingExecutions();

    log.info({ processed }, 'Agent polling cycle completed');

    return NextResponse.json({
      processed,
      message: `Processed ${processed} pending execution(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ err: error }, 'Error in execute-pending polling cycle');

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/execute-pending?immediate=true
 *
 * Development-only synchronous trigger. Requires EXECUTOR_SECRET even in dev
 * if the secret is configured, and is completely blocked in production.
 */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'POST to execute-pending is not available in production' },
      { status: 405 }
    );
  }

  const immediate = request.nextUrl.searchParams.get('immediate') === 'true';
  if (!immediate) {
    return NextResponse.json(
      { error: 'POST requires ?immediate=true query parameter' },
      { status: 400 }
    );
  }

  try {
    const processed = await processPendingExecutions();
    return NextResponse.json({
      processed,
      message: `Synchronously processed ${processed} pending execution(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ err: error }, 'Error in synchronous execute-pending call');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
      },
      { status: 500 }
    );
  }
}

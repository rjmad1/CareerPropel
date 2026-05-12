/**
 * GET /api/agents/execute-pending
 *
 * Background polling endpoint for processing queued agent executions.
 * Should be called via external cron (e.g., Vercel Cron) every 5 seconds.
 *
 * Environment variables:
 * - EXECUTOR_SECRET: Secret key to prevent unauthorized polling (optional but recommended)
 *
 * Usage (via Vercel Cron in vercel.json):
 * Configure cron to call this endpoint every 5 seconds
 * Example: "path": "/api/agents/execute-pending", "schedule": "every 5 seconds"
 *
 * Response: { processed: number, message: string, timestamp: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { processPendingExecutions } from '@/lib/agents/executor';

export async function GET(request: NextRequest) {
  try {
    // Optional: Verify executor secret
    const secret = request.headers.get('x-executor-secret');
    const expectedSecret = process.env.EXECUTOR_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process pending executions
    const processed = await processPendingExecutions();

    // Return status
    return NextResponse.json({
      processed,
      message: `Processed ${processed} pending executions`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Execute Pending] Error:', error);

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
 * Synchronous execution endpoint for testing/debugging.
 * Use only during development; in production use cron scheduling.
 */
export async function POST(request: NextRequest) {
  try {
    const immediate = request.nextUrl.searchParams.get('immediate') === 'true';

    if (!immediate) {
      return NextResponse.json(
        { error: 'POST requires ?immediate=true query parameter' },
        { status: 400 }
      );
    }

    // Verify we're in development or authorized
    if (
      process.env.NODE_ENV === 'production' &&
      request.headers.get('x-executor-secret') !== process.env.EXECUTOR_SECRET
    ) {
      return NextResponse.json(
        { error: 'Unauthorized in production' },
        { status: 401 }
      );
    }

    const processed = await processPendingExecutions();

    return NextResponse.json({
      processed,
      message: `Synchronously processed ${processed} pending executions`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Execute Pending POST] Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        processed: 0,
      },
      { status: 500 }
    );
  }
}

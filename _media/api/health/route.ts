import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';

export const dynamic = 'force-dynamic';

// Liveness — process is alive. No external dependency checks.
export const GET = withAuth(
  async (_request: NextRequest) => {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    });
  },
  {
    classification: 'public',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);


import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Liveness — process is alive. No external dependency checks.
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
}

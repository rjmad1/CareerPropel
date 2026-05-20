/**
 * API Routing for settings/ai-providers/scan
 * Handles:
 * - GET: Trigger local scan loopback detection
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { detectLocalRuntimes } from '@/lib/llm/local-scanner';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const scanResult = await detectLocalRuntimes();
    
    return NextResponse.json(scanResult);
  } catch (error) {
    console.error('[AI Provider Scanner API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Local scan operation failed' },
      { status: 500 }
    );
  }
}

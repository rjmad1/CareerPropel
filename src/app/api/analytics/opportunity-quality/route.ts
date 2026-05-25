/**
 * GET /api/analytics/opportunity-quality
 *
 * Returns quality scores for all active pipeline opportunities.
 * Outputs: quality score (0–100), success probability (inferred), signals,
 * alerts (compensation mismatch, stale, low match), and recommendation tier.
 *
 * All inferences labeled with confidence and data source.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeOpportunityQuality } from '@/lib/analytics/opportunity-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const result = await computeOpportunityQuality(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics/opportunity-quality]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

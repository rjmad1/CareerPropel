/**
 * GET /api/analytics/compensation
 *
 * Returns compensation intelligence derived exclusively from the user's
 * own recorded offers and job target salaries.
 *
 * Includes:
 *   - Offer comparison table
 *   - Salary trajectory over time
 *   - Heuristic percentile estimate (clearly labeled as estimated)
 *   - Negotiation outcome analytics
 *
 * The `benchmarkNote` field in the response always clarifies that
 * percentile estimates are NOT verified market data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeCompensationIntelligence } from '@/lib/analytics/compensation-intelligence';

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

    const result = await computeCompensationIntelligence(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics/compensation]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

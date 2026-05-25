/**
 * GET /api/analytics/longitudinal
 *
 * Returns 6-month longitudinal career intelligence:
 *   - Compensation growth trend (recent vs. prior offers)
 *   - Skill evolution (skills added over time)
 *   - Interview performance trend (mock session score progression)
 *   - Networking expansion (contact growth)
 *   - Monthly pipeline health (applications, offers, rejections per month)
 *   - Market alignment proxy (% of applications with match score ≥ 60%)
 *
 * Creates persistent career intelligence rather than session-based utility.
 * All metrics carry confidence levels and source provenance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeLongitudinalIntelligence } from '@/lib/analytics/longitudinal-intelligence';

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

    const result = await computeLongitudinalIntelligence(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics/longitudinal]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

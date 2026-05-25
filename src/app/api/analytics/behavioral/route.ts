/**
 * GET /api/analytics/behavioral
 *
 * Returns behavioral and execution analytics derived from application history,
 * contact CRM data, and agent execution logs.
 *
 * Tracks:
 *   - Application cadence (apps/week, trend, peak day, consistency)
 *   - Follow-up consistency score
 *   - Recruiter response patterns
 *   - Burnout risk level (inferred)
 *   - Workflow effectiveness composite score
 *   - Actionable behavioral insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeBehavioralAnalytics } from '@/lib/analytics/behavioral-analytics';

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

    const result = await computeBehavioralAnalytics(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics/behavioral]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

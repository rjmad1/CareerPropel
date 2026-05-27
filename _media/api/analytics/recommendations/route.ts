/**
 * GET /api/analytics/recommendations
 *
 * Generates personalized, evidence-backed strategic career recommendations.
 *
 * Combines:
 *   1. Rule-based recommendations (always present, zero LLM cost)
 *   2. LLM-enriched strategic insights (when ≥3 jobs in pipeline)
 *
 * Every recommendation includes:
 *   - category: domain area (application_strategy, interview_prep, etc.)
 *   - priority: critical | high | medium | low
 *   - evidence: specific data points that triggered the recommendation
 *   - action: concrete next step to take
 *   - confidence: high | medium | low
 *   - expectedImpact: measurable outcome to expect
 *
 * Query params:
 *   ?skipLLM=true  — return only rule-based recs (faster, no AI cost)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { generateStrategicRecommendations } from '@/lib/analytics/recommendations-engine';

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

    const result = await generateStrategicRecommendations(candidate.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[analytics/recommendations]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

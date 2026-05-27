/**
 * GET /api/analytics/dashboard
 *
 * Aggregated career intelligence dashboard. Fetches all analytics domains
 * in parallel and returns a consolidated response.
 *
 * Query params:
 *   ?include=opportunity,compensation,behavioral,longitudinal,recommendations
 *   (default: all domains)
 *
 * Each domain is fetched independently — a failure in one does not block others.
 * The `domainErrors` field in the response lists any domains that failed.
 *
 * Use this endpoint for dashboard-level views. For deep analysis of a single
 * domain, call the domain-specific endpoints directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { computeOpportunityQuality } from '@/lib/analytics/opportunity-intelligence';
import { computeCompensationIntelligence } from '@/lib/analytics/compensation-intelligence';
import { computeBehavioralAnalytics } from '@/lib/analytics/behavioral-analytics';
import { computeLongitudinalIntelligence } from '@/lib/analytics/longitudinal-intelligence';
import { generateStrategicRecommendations } from '@/lib/analytics/recommendations-engine';

export const dynamic = 'force-dynamic';

type DomainKey =
  | 'opportunity'
  | 'compensation'
  | 'behavioral'
  | 'longitudinal'
  | 'recommendations';

const ALL_DOMAINS: DomainKey[] = [
  'opportunity',
  'compensation',
  'behavioral',
  'longitudinal',
  'recommendations',
];

export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Parse requested domains (default: all)
    const includeParam = req.nextUrl.searchParams.get('include');
    const domains: DomainKey[] = includeParam
      ? (includeParam
          .split(',')
          .map((s) => s.trim())
          .filter((s): s is DomainKey => ALL_DOMAINS.includes(s as DomainKey)))
      : ALL_DOMAINS;

    if (domains.length === 0) {
      return NextResponse.json(
        { error: 'No valid domains specified. Valid: ' + ALL_DOMAINS.join(', ') },
        { status: 400 },
      );
    }

    const domainFns: Record<DomainKey, () => Promise<unknown>> = {
      opportunity: () => computeOpportunityQuality(candidate.id),
      compensation: () => computeCompensationIntelligence(candidate.id),
      behavioral: () => computeBehavioralAnalytics(candidate.id),
      longitudinal: () => computeLongitudinalIntelligence(candidate.id),
      recommendations: () => generateStrategicRecommendations(candidate.id),
    };

    // Fetch all requested domains in parallel; isolate failures
    const settled = await Promise.allSettled(
      domains.map((d) =>
        domainFns[d]().then((data) => ({ domain: d, data })),
      ),
    );

    const domainData: Record<string, unknown> = {};
    const domainErrors: Record<string, string> = {};

    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      const domain = domains[i];
      if (result.status === 'fulfilled') {
        domainData[domain] = result.value.data;
      } else {
        domainErrors[domain] =
          result.reason instanceof Error
            ? result.reason.message
            : 'Unknown error';
        console.error(`[analytics/dashboard] ${domain} failed:`, result.reason);
      }
    }

    return NextResponse.json({
      ...domainData,
      domainsIncluded: domains,
      ...(Object.keys(domainErrors).length > 0 ? { domainErrors } : {}),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics/dashboard]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 },
    );
  }
}

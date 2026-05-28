import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/middleware/withAuth';
import { buildOpportunityHealthInput } from '@/lib/workflow/health-input-builder';
import { scoreOpportunityHealth, healthLabel } from '@/lib/workflow/health-scorer';

export const dynamic = 'force-dynamic';

export const GET = withAuth(
  async (_req: NextRequest, auth, params) => {
    try {
      const jobId = params?.jobId as string;
      const { userEmail } = auth;
      const c = await prisma.candidate.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });
      if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

      const input = await buildOpportunityHealthInput(jobId, c.id);
      if (!input) return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 });

      const breakdown = scoreOpportunityHealth(input);
      const label = healthLabel(breakdown.overall);

      return NextResponse.json({ data: { breakdown, label, daysSinceLastActivity: input.daysSinceLastActivity } });
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number };
      return NextResponse.json(
        { error: { message: e.message ?? 'Failed to compute health score' } },
        { status: e.status ?? 500 },
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);


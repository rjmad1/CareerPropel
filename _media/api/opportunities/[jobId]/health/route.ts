import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { buildOpportunityHealthInput } from '@/lib/workflow/health-input-builder';
import { scoreOpportunityHealth, healthLabel } from '@/lib/workflow/health-scorer';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    const input = await buildOpportunityHealthInput(params.jobId, c.id);
    if (!input) return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 });

    const breakdown = scoreOpportunityHealth(input);
    const label = healthLabel(breakdown.overall);

    return NextResponse.json({ data: { breakdown, label, daysSinceLastActivity: input.daysSinceLastActivity } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to compute health score' } },
      { status: err.status ?? 500 },
    );
  }
}

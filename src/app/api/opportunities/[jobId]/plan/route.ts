import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth } from '@/lib/middleware/withAuth';
import { generateOpportunityPlan } from '@/lib/workflow/opportunity-planner';

export const dynamic = 'force-dynamic';

async function getCandidate(email: string) {
  const c = await prisma.candidate.findUnique({ where: { email }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Profile not found'), { status: 404 });
  return c;
}

export const GET = withAuth(
  async (_req: NextRequest, auth, params) => {
    try {
      const jobId = params?.jobId as string;
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      // Verify job ownership
      const job = await prisma.job.findFirst({
        where: { id: jobId, candidateId: candidate.id },
        select: { id: true },
      });
      if (!job) return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 });

      const plan = await prisma.opportunityPlan.findUnique({
        where: { jobId },
      });

      if (!plan) {
        return NextResponse.json({ error: { message: 'No plan generated yet — POST to generate' } }, { status: 404 });
      }

      return NextResponse.json({ data: plan });
    } catch (err: any) {
      return NextResponse.json(
        { error: { message: err.message ?? 'Failed to fetch plan' } },
        { status: err.status ?? 500 },
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);

export const POST = withAuth(
  async (_req: NextRequest, auth, params) => {
    try {
      const jobId = params?.jobId as string;
      const { userEmail } = auth;
      const candidate = await getCandidate(userEmail);

      const plan = await generateOpportunityPlan(jobId, candidate.id);
      return NextResponse.json({ data: plan }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json(
        { error: { message: err.message ?? 'Failed to generate plan' } },
        { status: err.status ?? 500 },
      );
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'medium',
  }
);


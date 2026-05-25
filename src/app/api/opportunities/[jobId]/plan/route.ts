import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { generateOpportunityPlan } from '@/lib/workflow/opportunity-planner';

export const dynamic = 'force-dynamic';

async function getCandidate(email: string) {
  const c = await prisma.candidate.findUnique({ where: { email }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Profile not found'), { status: 404 });
  return c;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    // Verify job ownership
    const job = await prisma.job.findFirst({
      where: { id: params.jobId, candidateId: candidate.id },
      select: { id: true },
    });
    if (!job) return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 });

    const plan = await prisma.opportunityPlan.findUnique({
      where: { jobId: params.jobId },
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
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const plan = await generateOpportunityPlan(params.jobId, candidate.id);
    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to generate plan' } },
      { status: err.status ?? 500 },
    );
  }
}

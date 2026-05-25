import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { createWorkflow } from '@/lib/workflow/engine';

export const dynamic = 'force-dynamic';

async function getCandidate(email: string) {
  const c = await prisma.candidate.findUnique({ where: { email }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Profile not found'), { status: 404 });
  return c;
}

export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const jobId = searchParams.get('jobId') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);

    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where: {
          candidateId: candidate.id,
          ...(status ? { status: status as any } : {}),
          ...(jobId ? { jobId } : {}),
        },
        include: {
          definition: { select: { name: true, displayName: true } },
          steps: { select: { stepKey: true, stepIndex: true, status: true, stepType: true, startedAt: true, completedAt: true } },
          _count: { select: { approvals: { where: { decision: null } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.workflowExecution.count({
        where: {
          candidateId: candidate.id,
          ...(status ? { status: status as any } : {}),
          ...(jobId ? { jobId } : {}),
        },
      }),
    ]);

    return NextResponse.json({ data: executions, total, limit, offset });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to list workflows' } },
      { status: err.status ?? 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const body = await req.json();
    const { templateId, jobId } = body;

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json({ error: { message: 'templateId is required' } }, { status: 400 });
    }

    const workflowId = await createWorkflow({
      templateId,
      candidateId: candidate.id,
      userId: userEmail,
      jobId: jobId ?? undefined,
      triggeredBy: 'user',
    });

    return NextResponse.json({ data: { workflowId } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to create workflow' } },
      { status: err.status ?? 500 },
    );
  }
}

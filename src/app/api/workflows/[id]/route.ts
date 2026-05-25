import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { cancelWorkflow } from '@/lib/workflow/engine';

export const dynamic = 'force-dynamic';

async function getCandidate(email: string) {
  const c = await prisma.candidate.findUnique({ where: { email }, select: { id: true } });
  if (!c) throw Object.assign(new Error('Profile not found'), { status: 404 });
  return c;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const execution = await prisma.workflowExecution.findUnique({
      where: { id: params.id },
      include: {
        definition: true,
        steps: { orderBy: { stepIndex: 'asc' } },
        approvals: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!execution) {
      return NextResponse.json({ error: { message: 'Workflow not found' } }, { status: 404 });
    }
    if (execution.candidateId !== candidate.id) {
      return NextResponse.json({ error: { message: 'Forbidden' } }, { status: 403 });
    }

    return NextResponse.json({ data: execution });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to get workflow' } },
      { status: err.status ?? 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await getCandidate(userEmail);

    const body = await req.json().catch(() => ({}));
    await cancelWorkflow(params.id, candidate.id, body.reason);

    return NextResponse.json({ data: { cancelled: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to cancel workflow' } },
      { status: err.status ?? 500 },
    );
  }
}

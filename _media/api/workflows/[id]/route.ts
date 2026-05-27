import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { getCandidate } from '@/lib/route-helpers/candidate';
import { cancelWorkflow } from '@/lib/workflow/engine';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';

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

    let reason: string | undefined;
    try {
      const body = await req.json();
      reason = typeof body?.reason === 'string' ? body.reason : undefined;
    } catch (parseErr) {
      log.warn({ err: parseErr }, 'DELETE /workflows/[id]: invalid JSON body');
      return NextResponse.json(
        { error: { message: 'Invalid JSON in request body' } },
        { status: 400 },
      );
    }

    await cancelWorkflow(params.id, candidate.id, reason);

    return NextResponse.json({ data: { cancelled: true } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to cancel workflow' } },
      { status: err.status ?? 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/agent/execution/[executionId]/resume
 * Resume a paused execution
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;

    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    if (execution.status !== 'paused') {
      return NextResponse.json(
        { error: 'Execution is not paused' },
        { status: 400 }
      );
    }

    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'running' },
    });

    return NextResponse.json(
      { execution: updated, message: 'Execution resumed' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resuming execution:', error);
    return NextResponse.json(
      { error: 'Failed to resume execution' },
      { status: 500 }
    );
  }
}

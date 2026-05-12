import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * POST /api/agent/execution/[executionId]/pause
 * Pause a running execution
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

    if (execution.status !== 'running') {
      return NextResponse.json(
        { error: 'Execution is not running' },
        { status: 400 }
      );
    }

    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'paused' },
    });

    return NextResponse.json(
      { execution: updated, message: 'Execution paused' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error pausing execution:', error);
    return NextResponse.json(
      { error: 'Failed to pause execution' },
      { status: 500 }
    );
  }
}

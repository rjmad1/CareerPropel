import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/agent/execution/[executionId]/cancel
 * Cancel an execution
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await context.params;

    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) {
      return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or failed execution' },
        { status: 400 }
      );
    }

    // Mark all pending tool calls as cancelled
    await prisma.toolCall.updateMany({
      where: {
        executionId,
        status: 'pending',
      },
      data: {
        status: 'failed',
        error: 'Execution was cancelled by user',
      },
    });

    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        errorMessage: 'Execution was cancelled by user',
      },
    });

    return NextResponse.json(
      { execution: updated, message: 'Execution cancelled' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling execution:', error);
    return NextResponse.json(
      { error: 'Failed to cancel execution' },
      { status: 500 }
    );
  }
}

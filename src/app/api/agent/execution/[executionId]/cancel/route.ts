import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getExecutionQueue } from '@/lib/queue/queues';
import { releaseExecutionSlots } from '@/lib/queue/concurrency';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/** Shared constant used for both the idempotency check and the error message written to the DB */
const CANCELLATION_ERROR_MSG = 'Execution was cancelled by user';

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

    if (execution.status === 'failed' && execution.errorMessage === CANCELLATION_ERROR_MSG) {
      return NextResponse.json(
        { execution, message: 'Execution already cancelled' },
        { status: 200 }
      );
    }

    if (execution.status === 'completed' || execution.status === 'failed') {
      return NextResponse.json(
        { error: 'Cannot cancel completed or failed execution' },
        { status: 400 }
      );
    }

    // Cancel active BullMQ job if present
    if (execution.queueJobId) {
      try {
        const queue = getExecutionQueue();
        const job = await queue.getJob(execution.queueJobId);
        if (job) {
          await job.discard();
          await job.remove();
        }
      } catch (err) {
        console.error(`[Cancel Route] Error discarding/removing BullMQ job ${execution.queueJobId}:`, err);
      }
    }

    // Mark all pending tool calls as cancelled
    await prisma.toolCall.updateMany({
      where: {
        executionId,
        status: 'pending',
      },
      data: {
        status: 'failed',
        error: CANCELLATION_ERROR_MSG,
      },
    });

    // Persist terminal state first, then release the slot so the slot is only freed
    // once the DB reflects the final status (mirrors the finally-after-processing pattern in workers.ts)
    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        errorMessage: CANCELLATION_ERROR_MSG,
      },
    });

    await releaseExecutionSlots(execution.userId, execution.agentType, executionId);

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


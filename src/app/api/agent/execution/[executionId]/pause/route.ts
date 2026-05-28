import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getExecutionQueue } from '@/lib/queue/queues';
import { releaseExecutionSlots } from '@/lib/queue/concurrency';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/agent/execution/[executionId]/pause
 * Pause a running execution
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

    if (execution.status === 'paused') {
      return NextResponse.json(
        { execution, message: 'Execution already paused' },
        { status: 200 }
      );
    }

    if (execution.status !== 'running') {
      return NextResponse.json(
        { error: 'Execution is not running' },
        { status: 400 }
      );
    }

    // Cancel active BullMQ job if present when pausing (it will be enqueued fresh upon resume)
    if (execution.queueJobId) {
      try {
        const queue = getExecutionQueue();
        const job = await queue.getJob(execution.queueJobId);
        if (job) {
          await job.discard();
          await job.remove();
        }
      } catch (err) {
        console.error(`[Pause Route] Error discarding/removing BullMQ job ${execution.queueJobId}:`, err);
      }
    }

    const updated = await prisma.agentExecution.update({
      where: { id: executionId },
      data: { status: 'paused' },
    });

    // Release slot only after DB persists the paused status to avoid a race
    await releaseExecutionSlots(execution.userId, execution.agentType, executionId);

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

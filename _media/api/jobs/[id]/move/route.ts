/**
 * POST /api/jobs/[id]/move
 *
 * Moves a job to a new pipeline stage and, if a trigger agent is configured
 * for that stage, enqueues it automatically.
 *
 * Body: { stage: JobStage }
 * Response: { job, agentType: string|null, executionId: string|null }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobStage, PIPELINE_STAGES } from '@/types/job';
import { getAgentForStage } from '@/lib/agents/stageTriggerMap';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { userEmail } = await getAuthContext();

    const { id } = await context.params;
    if (!id || id.length < 5) {
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 });
    }

    let body: { stage?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { stage } = body;
    if (!stage || !(PIPELINE_STAGES as string[]).includes(stage as string)) {
      return NextResponse.json({ error: 'Invalid or missing stage' }, { status: 400 });
    }
    const validStage = stage as JobStage;

    // Verify ownership
    const job = await prisma.job.findUnique({
      where: { id },
      include: { candidate: { select: { email: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.candidate.email !== userEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const previousStage = job.stage as JobStage;

    // Persist stage change + audit record atomically
    const [updated] = await prisma.$transaction([
      prisma.job.update({
        where: { id },
        data: { stage: validStage, updatedAt: new Date() },
      }),
      prisma.jobActivity.create({
        data: {
          jobId: id,
          action: 'stage_changed',
          metadata: { from: previousStage, to: validStage },
        },
      }),
    ]);

    // Determine if an agent should fire for the new stage
    const agentType = getAgentForStage(validStage);
    let executionId: string | undefined;

    if (agentType) {
      const useQueue = process.env.QUEUE_EXECUTION_ENABLED === 'true';
      if (useQueue) {
        try {
          executionId = await enqueueAgentExecution(agentType, userEmail, {
            jobId: id,
            companyName: job.company,
            jobDescription: job.description ?? '',
            stage: validStage,
          });
        } catch (enqueueErr: unknown) {
          // Cost ceiling or idempotency — log and continue, don't fail the move
          console.warn('[move] Agent enqueue skipped:', (enqueueErr as Error).message);
        }
      } else {
        // Legacy path: create execution record directly (no Redis needed)
        try {
          const execution = await prisma.agentExecution.create({
            data: {
              userId: userEmail,
              agentType,
              jobId: id,
              status: 'queued',
              input: JSON.stringify({
                jobId: id,
                companyName: job.company,
                jobDescription: job.description ?? '',
                stage: validStage,
              }),
              executionSource: 'queue',
            },
          });
          executionId = execution.id;
        } catch (createErr: unknown) {
          console.warn('[move] Legacy agent execution create skipped:', (createErr as Error).message);
        }
      }
    }

    return NextResponse.json({
      job: updated,
      agentType: agentType ?? null,
      executionId: executionId ?? null,
    });
  } catch (error) {
    console.error('[move] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

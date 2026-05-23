/**
 * POST /api/jobs/[id]/move
 *
 * Moves a job to a new pipeline stage and, if a trigger agent is configured
 * for that stage, enqueues it automatically.
 *
 * Body: { stage: JobStage }
 * Response: { job, executionId? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { JobStage, PIPELINE_STAGES } from '@/types/job';
import { getAgentForStage } from '@/lib/agents/stageTriggerMap';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

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

    // Verify ownership (only email needed — candidate.id unused)
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: { candidate: { select: { email: true } } },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    if (job.candidate.email !== email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const previousStage = job.stage;

    // Persist stage change + audit record atomically
    const [updated] = await prisma.$transaction([
      prisma.job.update({
        where: { id: params.id },
        data: { stage: validStage, updatedAt: new Date() },
      }),
      prisma.jobActivity.create({
        data: {
          jobId: params.id,
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
          executionId = await enqueueAgentExecution(agentType, email, {
            jobId: params.id,
            companyName: job.company,
            jobDescription: job.description ?? '',
            stage: validStage,
          });
        } catch (enqueueErr: unknown) {
          // Cost ceiling or idempotency — log and continue, don't fail the move
          console.warn('[move] Agent enqueue skipped:', (enqueueErr as Error).message);
        }
      } else {
        // Legacy path: create execution record directly
        try {
          const execution = await prisma.agentExecution.create({
            data: {
              userId: email,
              agentType,
              jobId: params.id,
              status: 'queued',
              input: JSON.stringify({
                jobId: params.id,
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
      { status: 500 }
    );
  }
}

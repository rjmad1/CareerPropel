/**
 * POST /api/ops/dlq/replay
 * Replay a single failed execution from the DLQ.
 *
 * Body: { executionId: string, force?: boolean }
 *
 * - "eligible" executions replay immediately.
 * - "conditional" executions require force=true (operator override).
 * - "ineligible" executions are rejected regardless of force.
 *
 * Replay NEVER runs if the execution has side-effect risk unless force=true.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { enqueueExecution } from '@/lib/queue/queues';
import { assessReplayEligibility, markReplayed } from '@/lib/observability/replay';
import { createLogger } from '@/lib/logging/logger';
import { sanitizeQueuePayload } from '@/lib/queue/payload';
import type { AgentType } from '@/lib/agents/prompts';

const replayLogger = createLogger({ component: 'dlq-replay' });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { executionId?: string; force?: boolean };
  const { executionId, force = false } = body;

  if (!executionId) {
    return NextResponse.json({ error: 'executionId is required' }, { status: 400 });
  }

  const assessment = await assessReplayEligibility(executionId);

  if (assessment.eligibility === 'ineligible') {
    return NextResponse.json(
      { error: 'Execution is not eligible for replay', reasons: assessment.reasons, assessment },
      { status: 422 }
    );
  }

  if (assessment.eligibility === 'conditional' && !force) {
    return NextResponse.json(
      {
        error:   'Execution has conditional replay risk — pass force=true to override',
        reasons: assessment.reasons,
        assessment,
      },
      { status: 409 }
    );
  }

  // Fetch original execution
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
  });

  if (!execution) {
    return NextResponse.json({ error: 'Execution not found' }, { status: 404 });
  }

  const promptContext = execution.input
    ? (sanitizeQueuePayload(JSON.parse(execution.input)) as Record<string, string | undefined>)
    : {};

  const replayRequestId    = crypto.randomUUID();
  const replayCorrelationId = crypto.randomUUID();

  // Create a fresh execution record for the replay
  const replayExecution = await prisma.agentExecution.create({
    data: {
      userId:        execution.userId,
      jobId:         execution.jobId,
      agentType:     execution.agentType,
      status:        'queued',
      input:         execution.input,
      requestId:     replayRequestId,
      correlationId: replayCorrelationId,
      metadata: {
        replayedFrom:         executionId,
        originalCorrelationId: execution.correlationId,
        originalRequestId:     execution.requestId,
        forcedReplay:          force,
      },
    },
  });

  await enqueueExecution({
    executionId:   replayExecution.id,
    userId:        execution.userId,
    agentType:     execution.agentType as AgentType,
    promptContext,
    requestId:     replayRequestId,
    correlationId: replayCorrelationId,
    submittedAt:   new Date().toISOString(),
    jobId:         execution.jobId ?? undefined,
  });

  // Mark the original as replayed
  await markReplayed(executionId);

  replayLogger.info(
    {
      originalExecutionId: executionId,
      replayExecutionId:   replayExecution.id,
      agentType:           execution.agentType,
      forced:              force,
    },
    'Execution replay enqueued'
  );

  return NextResponse.json({
    replayExecutionId: replayExecution.id,
    originalExecutionId: executionId,
    status: 'queued',
    forced: force,
  });
}

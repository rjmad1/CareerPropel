/**
 * GET /api/ops/dlq
 * Dead-letter queue inspection with replay eligibility assessment.
 *
 * Returns each DLQ job annotated with:
 *  - original failure reason
 *  - replay eligibility
 *  - side-effect and duplicate risk flags
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDeadLetterQueue } from '@/lib/queue/queues';
import { assessReplayEligibility } from '@/lib/observability/replay';
import { type DeadLetterPayload } from '@/lib/queue/dead-letter';

export async function GET(_req: NextRequest) {
  const dlq  = getDeadLetterQueue();
  const jobs = await dlq.getJobs(['waiting', 'active', 'failed'], 0, 100);

  const items = await Promise.all(
    jobs.map(async (job) => {
      const payload    = job.data as DeadLetterPayload;
      const assessment = await assessReplayEligibility(payload.executionId).catch(() => null);

      return {
        dlqJobId:      job.id,
        executionId:   payload.executionId,
        queueJobId:    payload.queueJobId,
        userId:        payload.userId,
        agentType:     payload.agentType,
        failedAt:      payload.failedAt,
        reason:        payload.reason,
        attemptsMade:  payload.attemptsMade,
        correlationId: payload.correlationId,
        requestId:     payload.requestId,
        replay:        assessment
          ? {
              eligibility:    assessment.eligibility,
              retryable:      assessment.retryable,
              sideEffectRisk: assessment.sideEffectRisk,
              duplicateRisk:  assessment.duplicateRisk,
              reasons:        assessment.reasons,
            }
          : null,
      };
    })
  );

  const counts = await dlq.getJobCounts('waiting', 'active', 'failed');

  return NextResponse.json({
    counts,
    items,
    timestamp: new Date().toISOString(),
  });
}

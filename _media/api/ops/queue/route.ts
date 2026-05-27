/**
 * GET /api/ops/queue
 * Queue observability console.
 *
 * Returns:
 *  - job counts per state
 *  - oldest queued job
 *  - stuck executions (active longer than 2× timeout)
 *  - retry storm detection (jobs with high attempt counts)
 *  - DLQ snapshot
 */

import { NextRequest, NextResponse } from 'next/server';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import { runtimeSettings } from '@/lib/runtime/settings';

const STUCK_THRESHOLD_MULTIPLIER = 2;
const RETRY_STORM_THRESHOLD      = 3; // attempts before flagging as potential poison job

export async function GET(_req: NextRequest) {
  const queue = getExecutionQueue();
  const dlq   = getDeadLetterQueue();

  const [counts, dlqCounts, activeJobs, waitingJobs, failedJobs, dlqJobs] = await Promise.all([
    queue.getJobCounts('active', 'waiting', 'delayed', 'failed', 'completed', 'paused'),
    dlq.getJobCounts('waiting', 'active', 'failed'),
    queue.getJobs(['active'], 0, 100),
    queue.getJobs(['waiting'], 0, 5),
    queue.getJobs(['failed'], 0, 20),
    dlq.getJobs(['waiting', 'active', 'failed'], 0, 20),
  ]);

  const now = Date.now();
  const stuckThresholdMs = runtimeSettings.executionTimeoutMs * STUCK_THRESHOLD_MULTIPLIER;

  // Detect stuck active jobs
  const stuckJobs = activeJobs
    .filter((job) => {
      const processedAt = job.processedOn ?? job.timestamp;
      return now - processedAt > stuckThresholdMs;
    })
    .map((job) => ({
      jobId:         job.id,
      executionId:   job.data.executionId,
      agentType:     job.data.agentType,
      userId:        job.data.userId,
      correlationId: job.data.correlationId,
      activeForMs:   now - (job.processedOn ?? job.timestamp),
      submittedAt:   job.data.submittedAt,
    }));

  // Detect potential retry storm / poison jobs
  const suspiciousJobs = failedJobs
    .filter((job) => (job.attemptsMade ?? 0) >= RETRY_STORM_THRESHOLD)
    .map((job) => ({
      jobId:        job.id,
      executionId:  job.data.executionId,
      agentType:    job.data.agentType,
      attemptsMade: job.attemptsMade,
      reason:       job.failedReason,
      failedAt:     job.finishedOn ? new Date(job.finishedOn).toISOString() : null,
    }));

  // Oldest queued job
  const oldestQueued = waitingJobs.length > 0
    ? {
        jobId:       waitingJobs[0].id,
        executionId: waitingJobs[0].data.executionId,
        agentType:   waitingJobs[0].data.agentType,
        waitingForMs: now - waitingJobs[0].timestamp,
        submittedAt:  waitingJobs[0].data.submittedAt,
      }
    : null;

  // DLQ jobs summary
  const dlqItems = dlqJobs.map((job) => ({
    jobId:        job.id,
    executionId:  (job.data as { executionId?: string }).executionId,
    agentType:    (job.data as { agentType?: string }).agentType,
    reason:       (job.data as { reason?: string }).reason,
    attemptsMade: (job.data as { attemptsMade?: number }).attemptsMade,
    failedAt:     (job.data as { failedAt?: string }).failedAt,
  }));

  return NextResponse.json({
    counts: {
      execution: counts,
      dlq:       dlqCounts,
    },
    oldestQueued,
    stuckJobs,
    suspiciousJobs,
    dlq: dlqItems,
    thresholds: {
      stuckAfterMs:         stuckThresholdMs,
      retryStormAtAttempts: RETRY_STORM_THRESHOLD,
    },
    timestamp: new Date().toISOString(),
  });
}

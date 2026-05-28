import { Worker, Job } from 'bullmq';
import { log } from '@/lib/logging/logger';
import { advanceWorkflow } from './engine';
import { createBullMQRedisConnection } from '@/lib/redis/redisClient';
import { WORKFLOW_QUEUE_NAME, getWorkflowQueue } from './queue';
import type { WorkflowJobData } from './types';

const DRAIN_TIMEOUT_MS = 120_000;
const HEALTH_CHECK_INTERVAL_MS = 10_000;

async function processWorkflowStep(job: Job<WorkflowJobData>): Promise<void> {
  const { workflowExecutionId, stepIndex } = job.data;
  const jobLog = log.child({ workflowExecutionId, stepIndex, jobId: job.id });

  jobLog.info('Processing workflow step');
  await advanceWorkflow(workflowExecutionId);
  jobLog.info('Workflow step processed');
}

export function startWorkflowWorker(): { worker: Worker<WorkflowJobData>; workerId: string } {
  const workerId = `wf-worker-${process.pid}-${Date.now()}`;

  log.info({ workerId }, 'Workflow BullMQ worker starting');

  const worker = new Worker<WorkflowJobData>(
    WORKFLOW_QUEUE_NAME,
    processWorkflowStep,
    {
      connection: createBullMQRedisConnection(),
      concurrency: 5, // Steps are lighter than LLM calls
    },
  );

  worker.on('completed', (job) => {
    log.info({ jobId: job.id, workflowId: job.data.workflowExecutionId }, 'Workflow step completed');
  });

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, err }, 'Workflow step failed');
  });

  worker.on('error', (err) => {
    log.error({ err }, 'Workflow worker error');
  });

  // Shutdown is coordinated externally by bin/worker.ts via drainAndCloseWorkflowWorker().

  return { worker, workerId };
}

/**
 * Gracefully drain and close the workflow worker.
 * Polls the actual active-job count so the process waits for in-flight steps to finish.
 * Exported so bin/worker.ts can coordinate shutdown alongside the agent worker.
 */
export async function drainAndCloseWorkflowWorker(
  worker: Worker<WorkflowJobData>,
  workerId: string,
): Promise<void> {
  log.info({ workerId }, 'Workflow worker draining');
  await worker.pause();

  const deadline = Date.now() + DRAIN_TIMEOUT_MS;
  await new Promise<void>((resolve) => {
    const check = setInterval(async () => {
      try {
        const counts = await getWorkflowQueue().getJobCounts('active');
        const activeCount = counts.active ?? 0;
        if (activeCount === 0 || Date.now() >= deadline) {
          clearInterval(check);
          resolve();
        } else {
          log.info({ activeCount, remainingMs: deadline - Date.now() }, 'Workflow drain in progress');
        }
      } catch (err) {
        log.error({ err }, 'Error during workflow drain check');
        if (Date.now() >= deadline) {
          clearInterval(check);
          resolve();
        }
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  });

  await worker.close();
  log.info({ workerId }, 'Workflow worker drained and closed');
}

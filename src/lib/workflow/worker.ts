import { Worker, Job } from 'bullmq';
import { log } from '@/lib/logging/logger';
import { advanceWorkflow } from './engine';
import { createBullMQRedisConnection } from '@/lib/queue/job-definitions';
import { WORKFLOW_QUEUE_NAME } from './queue';
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

export function startWorkflowWorker(): Worker<WorkflowJobData> {
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

  // Graceful shutdown — mirrors agent worker pattern
  const shutdown = async (signal: string) => {
    log.info({ signal, workerId }, 'Workflow worker shutdown signal received — draining');
    await worker.pause();

    const deadline = Date.now() + DRAIN_TIMEOUT_MS;
    const check = setInterval(async () => {
      if (Date.now() >= deadline) {
        clearInterval(check);
        await worker.close();
        log.info({ workerId }, 'Workflow worker drained and closed');
      }
    }, HEALTH_CHECK_INTERVAL_MS);
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));

  return worker;
}

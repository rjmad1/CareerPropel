import { Queue } from 'bullmq';
import { createBullMQRedisConnection } from '@/lib/queue/job-definitions';
import type { WorkflowJobData } from './types';

export const WORKFLOW_QUEUE_NAME = 'workflow-step';
export const WORKFLOW_SCHEMA_VERSION = 1;

export const WORKFLOW_JOB_DEFAULTS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { age: 7200 },  // keep 2h
  removeOnFail:     { age: 86400 }, // keep 24h
};

let _workflowQueue: Queue<WorkflowJobData> | null = null;

export function getWorkflowQueue(): Queue<WorkflowJobData> {
  if (!_workflowQueue) {
    _workflowQueue = new Queue<WorkflowJobData>(WORKFLOW_QUEUE_NAME, {
      connection: createBullMQRedisConnection(),
    });
  }
  return _workflowQueue;
}

/**
 * DEPRECATED RUNTIME PATH
 *
 * Canonical replacement:
 * src/lib/queue/queues.ts
 *
 * Removal condition:
 * Remove after legacy workflows and dynamic DAG steps are migrated to the new BullMQ queue model.
 */

import { Queue } from 'bullmq';
import { createBullMQRedisConnection } from '@/lib/redis/redisClient';
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

/**
 * Gracefully close the singleton Queue and release its Redis connection.
 * Idempotent — safe to call multiple times during shutdown.
 */
export async function closeWorkflowQueue(): Promise<void> {
  if (!_workflowQueue) return;
  const q = _workflowQueue;
  _workflowQueue = null; // prevent re-use before close completes
  try {
    await q.close();
  } catch (err) {
    // Re-throw so callers can decide whether to log/ignore
    throw err;
  }
}

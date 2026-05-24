import { Queue } from 'bullmq';
import { runtimeSettings } from '@/lib/runtime/settings';

export interface DeadLetterPayload {
  executionId: string;
  queueJobId: string;
  userId: string;
  agentType: string;
  failedAt: string;
  reason: string;
  attemptsMade: number;
  correlationId?: string;
  requestId?: string;
}

export function createDeadLetterQueue(connection: { host?: string } | unknown) {
  return new Queue<DeadLetterPayload>(runtimeSettings.deadLetterQueueName, {
    connection: connection as never,
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 1000,
    },
  });
}

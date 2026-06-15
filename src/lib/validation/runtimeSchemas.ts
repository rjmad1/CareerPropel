import { z } from 'zod';

export const executionJobDataSchema = z.object({
  executionId: z.string().min(1, 'executionId is required'),
  userId: z.string().min(1, 'userId is required'),
  agentType: z.string().min(1, 'agentType is required'),
  promptContext: z.record(z.string().nullable().optional()),
  requestId: z.string().min(1, 'requestId is required'),
  correlationId: z.string().min(1, 'correlationId is required'),
  submittedAt: z.string(),
  jobId: z.string().nullable().optional(),
  payloadVersion: z.string().optional().default('1.0.0'),
});

export const realtimeEventSchema = z.object({
  type: z.string().min(1, 'Event type is required'),
  executionId: z.string().min(1, 'executionId is required'),
  userId: z.string().min(1, 'userId is required'),
  agentType: z.string().min(1, 'agentType is required'),
  status: z.enum(['queued', 'running', 'paused', 'completed', 'failed', 'interrupted']),
  currentTask: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
  queueJobId: z.string().optional().nullable(),
  timestamp: z.string(),
  progress: z.number().min(0).max(100).optional(),
});

export type ExecutionJobDataInput = z.infer<typeof executionJobDataSchema>;
export type RealtimeEventInput = z.infer<typeof realtimeEventSchema>;

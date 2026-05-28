import { z } from 'zod';
import { validAgentTypes } from '../api/execute';

export const agentStatusSchema = z.enum(['idle', 'running', 'waiting', 'error', 'completed', 'success', 'failed', 'paused']);

export const baseEventSchema = z.object({
  timestamp: z.string().refine((s) => !Number.isNaN(Date.parse(s))),
  version: z.string().optional().default('1.0.0'),
});

export const agentStatusUpdateEventSchema = baseEventSchema.extend({
  type: z.literal('agent:status_update'),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: agentStatusSchema,
  queueDepth: z.number().int().nonnegative().optional(),
  currentTask: z.string().optional(),
  lastActivity: z.string(),
  tokensUsed: z.number().int().nonnegative().optional(),
  confidence: z.number().min(0).max(100).optional(),
  executionId: z.string().optional(),
});

export const toolExecutionEventSchema = baseEventSchema.extend({
  type: z.literal('tool:execution'),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  executionId: z.string().min(1),
  toolName: z.string().min(1),
  status: z.enum(['pending', 'success', 'failed']),
  duration: z.number().nonnegative(),
});

export const agentStartedEventSchema = baseEventSchema.extend({
  type: z.literal('agent:started'),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  executionId: z.string().min(1),
  jobId: z.string().optional(),
  input: z.record(z.unknown()),
});

export const agentCompletedEventSchema = baseEventSchema.extend({
  type: z.literal('agent:completed'),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  executionId: z.string().min(1),
  jobId: z.string().optional(),
  status: z.enum(['success', 'failed']),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  tokensUsed: z.number().int().nonnegative().optional(),
  duration: z.number().nonnegative(),
});

export const queueStatsEventSchema = baseEventSchema.extend({
  type: z.literal('queue:stats'),
  userId: z.string().min(1),
  pending: z.number().int().nonnegative(),
  running: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  avgProcessingTime: z.number().nonnegative(),
  throughputPerMin: z.number().nonnegative(),
});

export const errorEventSchema = baseEventSchema.extend({
  type: z.literal('error'),
  userId: z.string().min(1),
  message: z.string().min(1),
  code: z.string().min(1),
});

export const heartbeatEventSchema = baseEventSchema.extend({
  type: z.literal('heartbeat'),
});

export const executionStartedEventSchema = baseEventSchema.extend({
  type: z.literal('execution:started'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: z.literal('running'),
  currentTask: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
  queueJobId: z.string().optional().nullable(),
});

export const executionFailedEventSchema = baseEventSchema.extend({
  type: z.literal('execution:failed'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: z.literal('failed'),
  currentTask: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
  queueJobId: z.string().optional().nullable(),
});

export const executionQueuedEventSchema = baseEventSchema.extend({
  type: z.literal('execution:queued'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: z.literal('queued'),
  currentTask: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
  queueJobId: z.string().optional().nullable(),
});

export const executionCompletedEventSchema = baseEventSchema.extend({
  type: z.literal('execution:completed'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: z.literal('completed'),
  currentTask: z.string().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
  queueJobId: z.string().optional().nullable(),
});

export const executionStatusEventSchema = baseEventSchema.extend({
  type: z.literal('execution:status'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'paused']),
  progress: z.number(),
  currentTask: z.string().optional().nullable(),
  queueDepth: z.number().int().nonnegative().optional().nullable(),
  tokensUsed: z.number().int().nonnegative().optional().nullable(),
  confidence: z.number().optional().nullable(),
  correlationId: z.string().optional().nullable(),
  requestId: z.string().optional().nullable(),
});

export const logNewEventSchema = baseEventSchema.extend({
  type: z.literal('log:new'),
  executionId: z.string().min(1),
  userId: z.string().min(1),
  agentType: z.enum(validAgentTypes),
  log: z.object({
    id: z.string(),
    executionId: z.string(),
    level: z.string(),
    message: z.string(),
    metadata: z.any().nullable().optional(),
    timestamp: z.any(),
  }),
});

export const snapshotEventSchema = baseEventSchema.extend({
  type: z.literal('snapshot'),
  data: z.any().optional(),
});

export const agentExecutionUpdateEventSchema = baseEventSchema.extend({
  type: z.literal('agent:execution_update'),
  executionId: z.string(),
  status: z.string(),
  progress: z.number().optional(),
});

export const realtimeEventUnionSchema = z.discriminatedUnion('type', [
  agentStatusUpdateEventSchema,
  toolExecutionEventSchema,
  agentStartedEventSchema,
  agentCompletedEventSchema,
  queueStatsEventSchema,
  errorEventSchema,
  heartbeatEventSchema,
  executionStartedEventSchema,
  executionFailedEventSchema,
  executionQueuedEventSchema,
  executionCompletedEventSchema,
  executionStatusEventSchema,
  logNewEventSchema,
  snapshotEventSchema,
  agentExecutionUpdateEventSchema,
]);

export type RealtimeEventContract = z.infer<typeof realtimeEventUnionSchema>;

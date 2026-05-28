import { z } from 'zod';
import { validAgentTypes } from '../api/execute';

export const executionJobDataSchema = z.object({
  executionId: z.string().min(1, 'executionId is required'),
  userId: z.string().min(1, 'userId is required'),
  agentType: z.enum(validAgentTypes, {
    errorMap: () => ({ message: `Invalid agentType in queue payload` }),
  }),
  promptContext: z.record(z.string().nullable().optional()),
  requestId: z.string().min(1, 'requestId is required'),
  correlationId: z.string().min(1, 'correlationId is required'),
  submittedAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'submittedAt must be a valid datetime string',
  }),
  jobId: z.string().nullable().optional(),
  payloadVersion: z.string().optional().default('1.0.0'),
});

export const deadLetterPayloadSchema = z.object({
  executionId: z.string().min(1, 'executionId is required'),
  queueJobId: z.string().min(1, 'queueJobId is required'),
  userId: z.string().min(1, 'userId is required'),
  agentType: z.enum(validAgentTypes),
  failedAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), {
    message: 'failedAt must be a valid datetime string',
  }),
  reason: z.string().min(1, 'failure reason is required'),
  attemptsMade: z.number().int().nonnegative(),
  correlationId: z.string().optional(),
  requestId: z.string().optional(),
  failureClassification: z.enum([
    'TRANSIENT',
    'PROVIDER_FAILURE',
    'VALIDATION_FAILURE',
    'TIMEOUT',
    'SCHEMA_DRIFT',
    'RATE_LIMIT',
    'INTERNAL_ERROR',
    'UNKNOWN',
  ]).optional().default('UNKNOWN'),
});

export type ExecutionJobDataContract = z.infer<typeof executionJobDataSchema>;
export type DeadLetterPayloadContract = z.infer<typeof deadLetterPayloadSchema>;

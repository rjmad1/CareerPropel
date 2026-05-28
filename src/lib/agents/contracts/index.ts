import { z } from 'zod';
import { VALID_AGENT_TYPES } from '../prompts/prompts';

// 1. Core Agent Types Zod Validation
export const AgentTypeSchema = z.enum(VALID_AGENT_TYPES as [string, ...string[]]);

// 2. Execution Contract Schema
export const ExecutionContractSchema = z.object({
  executionId: z.string().cuid().or(z.string().uuid()),
  agentType: AgentTypeSchema,
  userId: z.string().email(),
  correlationId: z.string().optional(),
  requestId: z.string().optional(),
  promptContext: z.record(z.string().optional()),
});

// 3. Event Contract Schema
export const EventContractSchema = z.object({
  type: z.enum(['agent:started', 'agent:completed', 'agent:status_update']),
  userId: z.string().email(),
  agentType: z.string(),
  executionId: z.string().cuid().or(z.string().uuid()),
  status: z.enum(['running', 'completed', 'failed', 'waiting', 'idle', 'success']),
  timestamp: z.date().or(z.string()),
  input: z.record(z.unknown()).optional(),
  output: z.record(z.unknown()).optional(),
  error: z.string().optional(),
  tokensUsed: z.number().nonnegative().optional(),
  duration: z.number().nonnegative().optional(),
});

// 4. Retry Policy Contract Schema
export const RetryContractSchema = z.object({
  maxAttempts: z.number().int().min(1).max(5),
  backoffType: z.enum(['exponential', 'fixed']),
  delayMs: z.number().int().min(1000).max(60000),
});

// 5. Telemetry Contract Schema
export const TelemetryContractSchema = z.object({
  candidateId: z.string().optional(),
  presetName: z.string(),
  providerName: z.string(),
  modelName: z.string(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  latencyMs: z.number().int().nonnegative().optional(),
  isSuccess: z.boolean().optional(),
  errorMessage: z.string().nullable().optional(),
});

// 6. Tool Contract Schema
export const ToolContractSchema = z.object({
  toolId: z.string().uuid().or(z.string().cuid()),
  name: z.string(),
  arguments: z.record(z.unknown()),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
});

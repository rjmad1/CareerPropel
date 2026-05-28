import { z } from 'zod';

export const validAgentTypes = [
  'resume-tailor',
  'job-match',
  'interview-prep',
  'research',
  'follow-up',
  'networking',
  'role-intelligence',
  'fit-analysis',
  'strength-mapper',
  'conversion-scorer',
  'gap-analyzer',
  'pattern-miner',
] as const;

export const agentExecuteRequestSchema = z.object({
  agentType: z.enum(validAgentTypes, {
    errorMap: () => ({ message: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` }),
  }),
  context: z.record(z.unknown()).optional().default({}),
  jobId: z.string().optional(),
});

export const agentExecuteResponseSchema = z.object({
  executionId: z.string().min(1),
  queueJobId: z.string().nullable(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  message: z.string(),
});

export type AgentExecuteRequest = z.infer<typeof agentExecuteRequestSchema>;
export type AgentExecuteResponse = z.infer<typeof agentExecuteResponseSchema>;

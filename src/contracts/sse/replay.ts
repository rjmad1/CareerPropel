import { z } from 'zod';

export const lastEventIdSchema = z.string().regex(/^ev_\d+_\d+$/, 'Invalid Last-Event-ID format (must be ev_<timestamp>_<counter>)').nullable().optional();

export const sseReconnectRequestSchema = z.object({
  lastEventId: lastEventIdSchema,
  userId: z.string().min(1, 'userId is required for reconnect context'),
  streamId: z.string().uuid().optional(),
});

export const snapshotRecoverySchema = z.object({
  executionId: z.string().min(1),
  lastStatus: z.string(),
  progress: z.number().min(0).max(100).optional(),
  missedEventsCount: z.number().int().nonnegative(),
});

export type SseReconnectRequest = z.infer<typeof sseReconnectRequestSchema>;
export type SnapshotRecovery = z.infer<typeof snapshotRecoverySchema>;

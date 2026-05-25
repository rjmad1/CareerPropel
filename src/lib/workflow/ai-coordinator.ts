import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import type { AgentType } from '@/lib/agents/prompts';

const RECENCY_WINDOW_MS = 72 * 60 * 60 * 1000; // 72 hours

export interface CoordinatorResult {
  cached: boolean;
  executionId: string;
  output: Record<string, unknown>;
}

/**
 * Check if a recent completed execution exists for this agent+job.
 * Returns the cached result so the workflow can skip re-running the agent.
 */
export async function findCachedExecution(
  userId: string,
  agentType: AgentType,
  jobId: string | undefined,
): Promise<CoordinatorResult | null> {
  const since = new Date(Date.now() - RECENCY_WINDOW_MS);

  const existing = await prisma.agentExecution.findFirst({
    where: {
      userId,
      agentType,
      status: 'completed',
      ...(jobId ? { jobId } : {}),
      completedAt: { gte: since },
    },
    orderBy: { completedAt: 'desc' },
    select: { id: true, output: true },
  });

  if (!existing?.output) return null;

  try {
    const output = JSON.parse(existing.output) as Record<string, unknown>;
    return { cached: true, executionId: existing.id, output };
  } catch (err) {
    const outputLen = existing.output?.length ?? 0;
    const truncSuffix = outputLen > 200 ? '…' : '';
    const preview = typeof existing.output === 'string'
      ? existing.output.slice(0, 200) + truncSuffix
      : '[non-string output]';
    log.warn(
      { err, executionId: existing.id, outputLength: outputLen, rawOutputPreview: preview },
      'findCachedExecution: failed to parse cached output — skipping cache',
    );
    return null;
  }
}

/**
 * Invalidate cached executions for a job (e.g. after job stage change).
 * In practice we don't delete them — we just note this for future callers.
 * The recency window naturally expires stale caches.
 */
export function shouldInvalidateCache(
  agentType: AgentType,
  contextChanged: boolean,
): boolean {
  // research and resume-tailor output can become stale if job context changes
  return contextChanged && (agentType === 'research' || agentType === 'resume-tailor');
}

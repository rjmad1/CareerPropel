import { getProviderHealthReport } from '@/lib/observability/provider-health';
import { runtimeSettings } from '@/lib/runtime/settings';
import { partitionedQueues } from '@/lib/queue/queues';
import { createLogger } from '@/lib/logging/logger';

const adaptiveLogger = createLogger({ component: 'adaptive-concurrency' });

export interface ConcurrencyLimits {
  userLimit: number;
  agentLimit: number;
  workerConcurrency: number;
  reason: string;
}

/**
 * Derives dynamic concurrency bounds by examining provider latency, queue depths, and load-shed states.
 */
export async function getAdaptiveLimits(_userId: string, _agentType: string): Promise<ConcurrencyLimits> {
  const providerId = 'anthropic';
  const providerHealth = getProviderHealthReport(providerId);

  let userLimit = runtimeSettings.userConcurrencyLimit;
  let agentLimit = runtimeSettings.agentConcurrencyLimit;
  let workerConcurrency = runtimeSettings.queueConcurrency;
  let reason = 'System operating under nominal bounds.';

  // 1. Check Upstream Provider Latency & Error Degradation
  if (providerHealth.status === 'critical' || providerHealth.degradationScore >= 80) {
    // Critical degradation: Drop limits to absolute minimums to contain storms
    userLimit = 1;
    agentLimit = 1;
    workerConcurrency = 1;
    reason = `🚨 CRITICAL upstream provider degradation (${providerHealth.degradationScore}%). Limits minimized.`;
  } else if (providerHealth.status === 'degraded' || providerHealth.degradationScore >= 50) {
    // Symmetrical scale back
    userLimit = Math.max(1, Math.round(userLimit * 0.5));
    agentLimit = Math.max(1, Math.round(agentLimit * 0.5));
    workerConcurrency = Math.max(1, Math.round(workerConcurrency * 0.6));
    reason = `⚠️ MODERATE upstream provider degradation (${providerHealth.degradationScore}%). Concurrency scaled back.`;
  }

  // 2. Check Queue Starvation and Backlogs
  try {
    const counts = await partitionedQueues['standard'].getJobCounts('waiting');
    const waiting = counts.waiting ?? 0;

    if (waiting >= 100) {
      // Starvation detected: Squeeze standard concurrency to prevent runaway retry storms
      userLimit = Math.max(1, Math.round(userLimit * 0.7));
      workerConcurrency = Math.max(2, Math.round(workerConcurrency * 0.8));
      reason += ' Queue backlog detected. Throttling standard workers to preserve stability.';
    }
  } catch {
    // Ignore queue errors
  }

  adaptiveLogger.debug(
    { userLimit, agentLimit, workerConcurrency, reason },
    'Adaptive concurrency metrics re-calculated'
  );

  return { userLimit, agentLimit, workerConcurrency, reason };
}

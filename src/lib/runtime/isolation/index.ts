import { QueuePartition } from '@/lib/queue/queues';

export interface IsolationPolicy {
  concurrencyLimit: number;
  retryCeiling: number;
  executionTimeoutMs: number;
  queueAffinity: QueuePartition;
  degradedModeFallback: boolean;
}

export const AGENT_ISOLATION_POLICIES: Record<string, IsolationPolicy> = {
  'resume-tailor': {
    concurrencyLimit: 4,
    retryCeiling: 3,
    executionTimeoutMs: 600000, // 10 minutes
    queueAffinity: 'high-priority',
    degradedModeFallback: true,
  },
  'interview-prep': {
    concurrencyLimit: 3,
    retryCeiling: 3,
    executionTimeoutMs: 900000, // 15 minutes
    queueAffinity: 'high-priority',
    degradedModeFallback: false,
  },
  'research': {
    concurrencyLimit: 2,
    retryCeiling: 4,
    executionTimeoutMs: 1200000, // 20 minutes
    queueAffinity: 'standard',
    degradedModeFallback: true,
  },
  'job-match': {
    concurrencyLimit: 5,
    retryCeiling: 2,
    executionTimeoutMs: 300000, // 5 minutes
    queueAffinity: 'standard',
    degradedModeFallback: true,
  },
  'follow-up': {
    concurrencyLimit: 2,
    retryCeiling: 5,
    executionTimeoutMs: 600000, // 10 minutes
    queueAffinity: 'heavy',
    degradedModeFallback: true,
  },
  'networking': {
    concurrencyLimit: 2,
    retryCeiling: 5,
    executionTimeoutMs: 900000, // 15 minutes
    queueAffinity: 'heavy',
    degradedModeFallback: true,
  },
  'system-maintenance': {
    concurrencyLimit: 1,
    retryCeiling: 1,
    executionTimeoutMs: 1800000, // 30 minutes
    queueAffinity: 'maintenance',
    degradedModeFallback: false,
  },
};

const DEFAULT_POLICY: IsolationPolicy = {
  concurrencyLimit: 2,
  retryCeiling: 3,
  executionTimeoutMs: 900000,
  queueAffinity: 'standard',
  degradedModeFallback: true,
};

/**
 * Returns the operational isolation policy for an agent.
 */
export function getAgentIsolationPolicy(agentType: string): IsolationPolicy {
  return AGENT_ISOLATION_POLICIES[agentType] || DEFAULT_POLICY;
}

/**
 * Dynamically routes an execution request to the appropriate queue partition
 * based on agentType, execution cost, duration class, and retry attempts.
 */
export function routeQueuePartition(
  agentType: string,
  context: {
    estimatedCost?: number;
    durationMs?: number;
    retryCount?: number;
  } = {}
): QueuePartition {
  const policy = getAgentIsolationPolicy(agentType);
  
  // High retry count promotes standard/heavy jobs to heavy/dlq or keeps maintenance scoped
  if (context.retryCount && context.retryCount >= policy.retryCeiling) {
    return 'heavy';
  }

  // Cost-based upgrade/downgrade routing
  if (context.estimatedCost && context.estimatedCost > 0.50) {
    // High-cost operations route to heavy partition to isolate blast radius
    return 'heavy';
  }

  // Duration-based routing
  if (context.durationMs && context.durationMs > 600000) {
    return 'heavy';
  }

  return policy.queueAffinity;
}

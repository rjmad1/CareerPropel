import { prisma } from '@/lib/db';
import { getExecutionQueue } from '@/lib/queue/queues';
import { getProviderHealthReport } from '@/lib/observability/provider-health';
import { createLogger } from '@/lib/logging/logger';
import { redis } from '@/lib/redis/redisClient';

const admissionLogger = createLogger({ component: 'admission-control' });

export interface AdmissionDecision {
  allowed: boolean;
  reason?: string;
  loadShedActive: boolean;
  suggestedModelDowngrade?: boolean;
}

const GLOBAL_QUEUE_DEPTH_LIMIT = 500;
const USER_CONCURRENCY_LIMIT = 5;
const USER_DAILY_EXECUTION_LIMIT = 100;
const USER_DAILY_COST_LIMIT_USD = 10.0;

// Non-critical agent types that can be shed during provider degradation
const NON_CRITICAL_AGENTS = ['follow-up', 'networking', 'gap-analyzer', 'pattern-miner'];

/**
 * Validates whether a new agent execution request can be admitted into the system.
 */
export async function evaluateAdmission(
  userId: string,
  agentType: string
): Promise<AdmissionDecision> {
  const decision: AdmissionDecision = {
    allowed: true,
    loadShedActive: false,
  };

  // ─── 0. QUARANTINE STATUS CHECKS ───
  try {
    const isQuarantined = await redis.sismember('quarantine:users', userId);
    if (isQuarantined) {
      decision.allowed = false;
      decision.reason = 'User account is temporarily quarantined due to runaway daily spend bounds';
      admissionLogger.warn({ userId, agentType }, 'Admission rejected: User is quarantined');
      return decision;
    }
  } catch (err: any) {
    // Graceful degrade if redis check fails
  }

  // ─── 1. GLOBAL RESOURCE SATURATION CHECKS ───
  try {
    const execQueue = getExecutionQueue();
    const counts = await execQueue.getJobCounts('waiting', 'active');
    const totalPending = (counts.waiting ?? 0) + (counts.active ?? 0);

    if (totalPending >= GLOBAL_QUEUE_DEPTH_LIMIT) {
      decision.allowed = false;
      decision.reason = `Global system queue saturation limit reached (${totalPending}/${GLOBAL_QUEUE_DEPTH_LIMIT} pending jobs)`;
      admissionLogger.warn({ userId, agentType, totalPending }, 'Admission rejected: Global queue saturation');
      return decision;
    }
  } catch (err: any) {
    // If BullMQ fails to respond, reject as degraded
    decision.allowed = false;
    decision.reason = 'Global queue system is currently degraded or unavailable';
    return decision;
  }

  // ─── 2. LLM PROVIDER HEALTH & DYNAMIC LOAD SHEDDING ───
  const providerId = 'anthropic';
  const providerReport = getProviderHealthReport(providerId);
  
  if (providerReport.status === 'critical' || providerReport.degradationScore >= 80) {
    // Critical degradation: Load shed all requests
    decision.allowed = false;
    decision.reason = `Upstream LLM Provider (${providerId}) is experiencing critical outage (Degradation: ${providerReport.degradationScore}%)`;
    admissionLogger.warn({ userId, agentType, providerReport }, 'Admission rejected: LLM provider outage');
    return decision;
  }

  if (providerReport.status === 'degraded' || providerReport.degradationScore >= 50) {
    decision.loadShedActive = true;
    
    // Shed non-critical agent tasks immediately
    if (NON_CRITICAL_AGENTS.includes(agentType)) {
      decision.allowed = false;
      decision.reason = `Dynamic Load Shedding Active: Non-critical agent '${agentType}' is temporarily paused due to upstream LLM degradation.`;
      admissionLogger.info({ userId, agentType, providerReport }, 'Admission rejected: Load shedding non-critical agent');
      return decision;
    }

    // Degrade model settings for critical agents to reduce burden/cost
    decision.suggestedModelDowngrade = true;
    admissionLogger.info({ userId, agentType }, 'Admission Warning: Load shedding suggested model downgrade active');
  }

  // ─── 3. PER-USER BUDGET & CAPACITY ENFORCEMENT ───
  // A. User Concurrency ceiling

  const activeConcurrency = await prisma.agentExecution.count({
    where: {
      userId,
      status: 'running',
    },
  });

  if (activeConcurrency >= USER_CONCURRENCY_LIMIT) {
    decision.allowed = false;
    decision.reason = `User concurrency ceiling reached (${activeConcurrency}/${USER_CONCURRENCY_LIMIT} active runs)`;
    admissionLogger.warn({ userId, agentType, activeConcurrency }, 'Admission rejected: User concurrency ceiling');
    return decision;
  }

  // B. User Daily Execution Budget
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const dailyExecutions = await prisma.agentExecution.count({
    where: {
      userId,
      createdAt: { gte: startOfToday },
      status: { in: ['completed', 'running', 'queued'] },
    },
  });

  if (dailyExecutions >= USER_DAILY_EXECUTION_LIMIT) {
    decision.allowed = false;
    decision.reason = `User daily execution budget exceeded (${dailyExecutions}/${USER_DAILY_EXECUTION_LIMIT} runs today)`;
    admissionLogger.warn({ userId, agentType, dailyExecutions }, 'Admission rejected: User daily run budget');
    return decision;
  }

  // C. User Daily Token/Cost Budget
  const dailyCostSum = await prisma.agentExecution.aggregate({
    where: {
      userId,
      createdAt: { gte: startOfToday },
      status: 'completed',
    },
    _sum: {
      costUsd: true,
    },
  });

  const dailyCostUsd = dailyCostSum._sum.costUsd || 0;
  if (dailyCostUsd >= USER_DAILY_COST_LIMIT_USD) {
    decision.allowed = false;
    decision.reason = `User daily spend limit exceeded ($${dailyCostUsd.toFixed(2)}/$${USER_DAILY_COST_LIMIT_USD.toFixed(2)} spent today)`;
    admissionLogger.warn({ userId, agentType, dailyCostUsd }, 'Admission rejected: User daily cost limit');
    return decision;
  }

  return decision;
}

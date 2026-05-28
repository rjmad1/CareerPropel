import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { redis } from '@/lib/redis/redisClient';

const ecoLogger = createLogger({ component: 'runtime-economics' });

// Budget settings (USD)
const DAILY_BUDGET_CAP_USD = 50.0;
const USER_DAILY_QUARANTINE_BUDGET_USD = 15.0;

export interface CostAttribution {
  costPerAgent: Record<string, number>;
  costPerUser: Record<string, number>;
  costPerProvider: Record<string, number>;
  retryBurnRateUsd: number;
  degradedModeSavingsUsd: number;
  timestamp: string;
}

export interface SpendProtectionReport {
  abnormalSpendAlert: boolean;
  budgetExhausted: boolean;
  quarantinedUsersCount: number;
  recommendations: string[];
}

/**
 * Derives comprehensive runtime economics, cost attribution, and retry burn metrics.
 */
export async function getRuntimeEconomics(windowDays = 7): Promise<CostAttribution> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const executions = await prisma.agentExecution.findMany({
    where: {
      createdAt: { gte: since },
      costUsd: { not: null },
    },
    select: {
      userId: true,
      agentType: true,
      provider: true,
      costUsd: true,
      attempts: true,
      fallbackUsed: true,
    },
  });

  const costPerAgent: Record<string, number> = {};
  const costPerUser: Record<string, number> = {};
  const costPerProvider: Record<string, number> = {};
  let retryBurnRateUsd = 0;
  let degradedModeSavingsUsd = 0;

  for (const ex of executions) {
    const cost = ex.costUsd || 0;

    // 1. Attributed to Agent
    costPerAgent[ex.agentType] = (costPerAgent[ex.agentType] || 0) + cost;

    // 2. Attributed to User
    costPerUser[ex.userId] = (costPerUser[ex.userId] || 0) + cost;

    // 3. Attributed to Provider
    const prov = ex.provider || 'unknown';
    costPerProvider[prov] = (costPerProvider[prov] || 0) + cost;

    // 4. Retry Amplification Cost Tracking
    if (ex.attempts > 1) {
      // Burn rate represents cost spent on attempts beyond the first
      const retryRatio = (ex.attempts - 1) / ex.attempts;
      retryBurnRateUsd += cost * retryRatio;
    }

    // 5. Degraded Mode / Fallback Savings
    if (ex.fallbackUsed) {
      // Estimated savings: standard model cost is roughly 5x fallback model cost
      degradedModeSavingsUsd += cost * 4.0;
    }
  }

  // Round values
  const round = (val: number) => Number(val.toFixed(4));
  
  const roundRecord = (rec: Record<string, number>) => {
    const res: Record<string, number> = {};
    for (const [k, v] of Object.entries(rec)) {
      res[k] = round(v);
    }
    return res;
  };

  return {
    costPerAgent: roundRecord(costPerAgent),
    costPerUser: roundRecord(costPerUser),
    costPerProvider: roundRecord(costPerProvider),
    retryBurnRateUsd: round(retryBurnRateUsd),
    degradedModeSavingsUsd: round(degradedModeSavingsUsd),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Evaluates automated protections: runaway retries, budget exhaustion, and user quarantine sweeps.
 */
export async function enforceSpendProtections(): Promise<SpendProtectionReport> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const report: SpendProtectionReport = {
    abnormalSpendAlert: false,
    budgetExhausted: false,
    quarantinedUsersCount: 0,
    recommendations: [],
  };

  // 1. Verify Global daily spend limit
  const globalDailySpendSum = await prisma.agentExecution.aggregate({
    where: {
      createdAt: { gte: startOfToday },
      status: 'completed',
    },
    _sum: {
      costUsd: true,
    },
  });

  const dailySpend = globalDailySpendSum._sum.costUsd || 0;
  if (dailySpend >= DAILY_BUDGET_CAP_USD) {
    report.budgetExhausted = true;
    report.recommendations.push(`🚨 GLOBAL BUDGET EXHAUSTED: Daily spend ($${dailySpend.toFixed(2)}) has exceeded cap ($${DAILY_BUDGET_CAP_USD.toFixed(2)}). All non-critical agent execution paused.`);
    ecoLogger.error({ dailySpend }, 'Global budget exhausted!');
  }

  // 2. Identify and quarantine high-spending users
  const userSpends = await prisma.agentExecution.groupBy({
    by: ['userId'],
    where: {
      createdAt: { gte: startOfToday },
      status: 'completed',
    },
    _sum: {
      costUsd: true,
    },
  });

  for (const row of userSpends) {
    const spend = row._sum.costUsd || 0;
    if (spend >= USER_DAILY_QUARANTINE_BUDGET_USD) {
      report.quarantinedUsersCount++;
      report.abnormalSpendAlert = true;
      report.recommendations.push(`⚠️ Runaway spend quarantined: User ${row.userId} has consumed $${spend.toFixed(2)} today.`);
      
      // Persist quarantine status in Redis for fast-path block in admission-control
      await redis.sadd('quarantine:users', row.userId);
      await redis.expire('quarantine:users', 86400); // expire after 1 day
    }
  }

  // 3. Retry Amplification warning
  const econ = await getRuntimeEconomics(1);
  if (econ.retryBurnRateUsd > DAILY_BUDGET_CAP_USD * 0.2) {
    report.abnormalSpendAlert = true;
    report.recommendations.push(`🚨 HIGH RETRY BURN RATE: Over $${econ.retryBurnRateUsd.toFixed(2)} has been burned on retry attempts in the last 24h. Recommend enabling model degradation mode.`);
  }

  return report;
}

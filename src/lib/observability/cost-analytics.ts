/**
 * AI cost governance analytics.
 *
 * Queries AgentExecution.tokenCount + providerId against provider pricing maps
 * to produce per-agent and per-user cost estimates.
 *
 * Prices are approximate public rates — replace with actuals via env config.
 */

import { prisma } from '@/lib/db';

// ── Provider pricing map (USD per 1M tokens) ──────────────────────────────
// Defaults reflect approximate public Anthropic / Nvidia NIM rates.

const DEFAULT_PRICING: Record<string, { inputPer1M: number; outputPer1M: number }> = {
  anthropic:   { inputPer1M: 3.0,  outputPer1M: 15.0 },
  'nvidia-nim': { inputPer1M: 0.2,  outputPer1M: 0.2 },
};

function getPricing(providerId: string | null) {
  const key = (providerId ?? 'anthropic').toLowerCase();
  return DEFAULT_PRICING[key] ?? DEFAULT_PRICING.anthropic;
}

// Assume 50/50 input/output split (conservative) when we only have total tokens.
function estimateCost(tokens: number, providerId: string | null): number {
  const pricing    = getPricing(providerId);
  const blendedPer1M = (pricing.inputPer1M + pricing.outputPer1M) / 2;
  return (tokens / 1_000_000) * blendedPer1M;
}

// ── Queries ────────────────────────────────────────────────────────────────

export interface AgentCostRow {
  agentType:        string;
  executions:       number;
  totalTokens:      number;
  estimatedUSD:     number;
  avgTokensPerRun:  number;
}

export interface UserCostRow {
  userId:           string;
  executions:       number;
  totalTokens:      number;
  estimatedUSD:     number;
}

export interface CostSnapshot {
  windowDays:     number;
  totalTokens:    number;
  estimatedUSD:   number;
  byAgent:        AgentCostRow[];
  byUser:         UserCostRow[];
  topSpenders:    UserCostRow[]; // top 10 by token usage
  anomalies:      CostAnomaly[];
  snapshotAt:     string;
}

export interface CostAnomaly {
  type:     'runaway_execution' | 'spike_user' | 'spike_agent';
  subject:  string;
  tokens:   number;
  details:  string;
}

const RUNAWAY_TOKENS   = 100_000; // single execution that used > 100K tokens
const SPIKE_USER_RATIO = 5;       // user whose token use is 5× the per-user average

export async function getCostSnapshot(windowDays = 7): Promise<CostSnapshot> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const executions = await prisma.agentExecution.findMany({
    where: {
      createdAt:  { gte: since },
      tokenCount: { gt: 0 },
      status:     { in: ['completed', 'failed'] },
    },
    select: {
      id:         true,
      userId:     true,
      agentType:  true,
      tokenCount: true,
      providerId: true,
    },
  });

  // ── Aggregate by agent ────────────────────────────────────────────────

  const byAgentMap = new Map<string, { count: number; tokens: number; provider: string | null }>();

  for (const ex of executions) {
    const key = ex.agentType;
    const cur = byAgentMap.get(key) ?? { count: 0, tokens: 0, provider: ex.providerId };
    cur.count  += 1;
    cur.tokens += ex.tokenCount ?? 0;
    byAgentMap.set(key, cur);
  }

  const byAgent: AgentCostRow[] = Array.from(byAgentMap.entries()).map(([agentType, agg]) => ({
    agentType,
    executions:      agg.count,
    totalTokens:     agg.tokens,
    estimatedUSD:    Number(estimateCost(agg.tokens, agg.provider).toFixed(4)),
    avgTokensPerRun: agg.count > 0 ? Math.round(agg.tokens / agg.count) : 0,
  })).sort((a, b) => b.totalTokens - a.totalTokens);

  // ── Aggregate by user ─────────────────────────────────────────────────

  const byUserMap = new Map<string, { count: number; tokens: number; provider: string | null }>();

  for (const ex of executions) {
    const key = ex.userId;
    const cur = byUserMap.get(key) ?? { count: 0, tokens: 0, provider: ex.providerId };
    cur.count  += 1;
    cur.tokens += ex.tokenCount ?? 0;
    byUserMap.set(key, cur);
  }

  const byUser: UserCostRow[] = Array.from(byUserMap.entries()).map(([userId, agg]) => ({
    userId,
    executions:  agg.count,
    totalTokens: agg.tokens,
    estimatedUSD: Number(estimateCost(agg.tokens, agg.provider).toFixed(4)),
  })).sort((a, b) => b.totalTokens - a.totalTokens);

  const totalTokens  = executions.reduce((s, e) => s + (e.tokenCount ?? 0), 0);
  const estimatedUSD = Number(
    executions.reduce((s, e) => s + estimateCost(e.tokenCount ?? 0, e.providerId), 0).toFixed(4)
  );

  // ── Anomaly detection ─────────────────────────────────────────────────

  const anomalies: CostAnomaly[] = [];

  // Runaway executions
  for (const ex of executions) {
    if ((ex.tokenCount ?? 0) > RUNAWAY_TOKENS) {
      anomalies.push({
        type:    'runaway_execution',
        subject: ex.id,
        tokens:  ex.tokenCount ?? 0,
        details: `Execution ${ex.id} (${ex.agentType}) used ${ex.tokenCount?.toLocaleString()} tokens`,
      });
    }
  }

  // Per-user spike detection
  if (byUser.length > 1) {
    const avgUserTokens = totalTokens / byUser.length;
    for (const row of byUser) {
      if (row.totalTokens > avgUserTokens * SPIKE_USER_RATIO) {
        anomalies.push({
          type:    'spike_user',
          subject: row.userId,
          tokens:  row.totalTokens,
          details: `User ${row.userId} consumed ${row.totalTokens.toLocaleString()} tokens (${SPIKE_USER_RATIO}× avg)`,
        });
      }
    }
  }

  return {
    windowDays,
    totalTokens,
    estimatedUSD,
    byAgent,
    byUser,
    topSpenders: byUser.slice(0, 10),
    anomalies,
    snapshotAt: new Date().toISOString(),
  };
}

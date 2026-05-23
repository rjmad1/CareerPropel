/**
 * chainExecutor
 *
 * Implements multi-agent chaining: `research` must complete before
 * `interview-prep` runs for the same job, because interview prep
 * quality depends on company intel.
 *
 * Chain definitions live here.  The executor checks whether the
 * upstream execution has completed and either waits (via a BullMQ
 * dependency job) or returns the upstream output to inject as context.
 */

import { prisma } from '@/lib/db';
import { AgentType } from './prompts';

interface ResearchOutput {
  cultureSummary?: string;
  competitivePosition?: string;
  growthTrajectory?: string;
  recentNews?: string[];
  redFlags?: string[];
}

function isResearchOutput(r: unknown): r is ResearchOutput {
  return typeof r === 'object' && r !== null && !Array.isArray(r);
}

/** Map of agent → agents that must complete first for the same jobId */
export const AGENT_DEPENDENCIES: Partial<Record<AgentType, AgentType[]>> = {
  'interview-prep': ['research'],
};

export interface ChainContext {
  /** Upstream agent output keyed by agentType */
  upstreamOutputs: Record<string, Record<string, unknown>>;
  /** True if all dependencies are satisfied */
  ready: boolean;
  /** agentTypes that are still pending */
  pendingDeps: AgentType[];
}

/**
 * Check whether all upstream dependencies for `agentType` are satisfied
 * for a given job.  Returns upstream outputs that can be merged into context.
 */
export async function checkChainDependencies(
  agentType: AgentType,
  userId: string,
  jobId: string
): Promise<ChainContext> {
  const deps = AGENT_DEPENDENCIES[agentType];

  if (!deps || deps.length === 0) {
    return { upstreamOutputs: {}, ready: true, pendingDeps: [] };
  }

  const upstreamOutputs: Record<string, Record<string, unknown>> = {};
  const pendingDeps: AgentType[] = [];

  for (const dep of deps) {
    // Find the most recent completed execution of this dep for this user+job
    const completed = await prisma.agentExecution.findFirst({
      where: {
        userId,
        agentType: dep,
        status: 'completed',
        jobId,
      },
      orderBy: { completedAt: 'desc' },
      select: { output: true, agentType: true },
    });

    if (completed?.output) {
      try {
        upstreamOutputs[dep] = JSON.parse(completed.output);
      } catch {
        upstreamOutputs[dep] = {};
      }
    } else {
      pendingDeps.push(dep);
    }
  }

  return {
    upstreamOutputs,
    ready: pendingDeps.length === 0,
    pendingDeps,
  };
}

/**
 * Merge upstream outputs into context so downstream agents receive
 * structured intel from their dependencies.
 *
 * Example: research output → companyInfo string for interview-prep.
 */
export function mergeUpstreamContext(
  agentType: AgentType,
  baseContext: Record<string, unknown>,
  upstreamOutputs: Record<string, Record<string, unknown>>
): Record<string, unknown> {
  const merged = { ...baseContext };

  const rawResearch: unknown = upstreamOutputs['research'];
  if (agentType === 'interview-prep' && isResearchOutput(rawResearch)) {
    const research = rawResearch;
    const parts: string[] = [];
    if (typeof research.cultureSummary === 'string') parts.push(research.cultureSummary);
    if (typeof research.competitivePosition === 'string') parts.push(research.competitivePosition);
    if (typeof research.growthTrajectory === 'string') parts.push(research.growthTrajectory);
    if (Array.isArray(research.recentNews) && research.recentNews.length > 0) {
      parts.push(`Recent news: ${research.recentNews.join('; ')}`);
    }
    if (Array.isArray(research.redFlags) && research.redFlags.length > 0) {
      parts.push(`Red flags: ${research.redFlags.join('; ')}`);
    }
    const companyInfo = parts.join('\n');
    if (companyInfo) merged.companyInfo = companyInfo;
  }

  return merged;
}

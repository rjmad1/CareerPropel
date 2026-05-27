/**
 * Replay safety analysis.
 *
 * Before replaying a failed execution the platform MUST assess:
 *  - whether the original failure is retryable
 *  - whether the payload contains side-effecting operations
 *  - whether the execution has already been replayed
 *  - whether the payload is structurally valid
 *
 * Replay NEVER blindly re-runs executions that touch external systems
 * (email, mutations, external side effects).
 */

import { prisma } from '@/lib/db';
import { classifyError } from '@/lib/observability/failure-classification';

// ── Types ──────────────────────────────────────────────────────────────────

export type ReplayEligibility = 'eligible' | 'conditional' | 'ineligible';

export interface ReplayAssessment {
  executionId:        string;
  eligibility:        ReplayEligibility;
  retryable:          boolean;
  sideEffectRisk:     boolean;
  duplicateRisk:      boolean;
  priorReplayCount:   number;
  failureType:        string | null;
  sanitizedInputKeys: string[];
  reasons:            string[];
  assessedAt:         string;
}

// ── Agent types that must never be auto-replayed ───────────────────────────
// These touch external systems: email senders, mutation agents, integrations.

const SIDE_EFFECT_AGENT_TYPES = new Set([
  'follow-up',    // sends emails / messages
  'networking',   // may send connection requests
  'application',  // submits applications to external ATS
]);

// ── Assessment ─────────────────────────────────────────────────────────────

export async function assessReplayEligibility(executionId: string): Promise<ReplayAssessment> {
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    include: {
      eventLogs: {
        where:   { level: 'ERROR' },
        orderBy: { timestamp: 'desc' },
        take:    1,
      },
    },
  });

  const reasons: string[] = [];

  if (!execution) {
    return {
      executionId,
      eligibility:        'ineligible',
      retryable:          false,
      sideEffectRisk:     false,
      duplicateRisk:      false,
      priorReplayCount:   0,
      failureType:        null,
      sanitizedInputKeys: [],
      reasons:            ['Execution not found'],
      assessedAt:         new Date().toISOString(),
    };
  }

  // Only terminal states can be replayed
  if (execution.status !== 'failed') {
    reasons.push(`Execution is in state "${execution.status}" — only failed executions can be replayed`);
  }

  // Extract failure classification from last ERROR log
  const lastError = execution.eventLogs[0];
  const logMeta   = lastError?.metadata as Record<string, unknown> | null | undefined;
  const failureType = (logMeta?.failureType as string) ?? null;
  const retryable   = failureType
    ? (classifyError(new Error(execution.errorMessage ?? ''), {}).retryable)
    : false;

  if (!retryable) {
    reasons.push(`Failure type "${failureType ?? 'unknown'}" is not retryable`);
  }

  // Side-effect risk
  const sideEffectRisk = SIDE_EFFECT_AGENT_TYPES.has(execution.agentType);
  if (sideEffectRisk) {
    reasons.push(`Agent type "${execution.agentType}" may trigger external side effects — manual review required`);
  }

  // Prior replay count (tracked in metadata)
  const meta            = execution.metadata as Record<string, unknown> | null | undefined;
  const priorReplayCount = Number(meta?.replayCount ?? 0);
  const duplicateRisk    = priorReplayCount > 0;
  if (duplicateRisk) {
    reasons.push(`Execution has been replayed ${priorReplayCount} time(s) — duplicate risk`);
  }

  // Sanitized input keys (surface what's in the payload without the values)
  let sanitizedInputKeys: string[] = [];
  try {
    const input = execution.input ? JSON.parse(execution.input) : {};
    sanitizedInputKeys = Object.keys(input);
  } catch {
    // non-fatal
  }

  // Determine eligibility
  let eligibility: ReplayEligibility;
  if (execution.status !== 'failed' || !retryable) {
    eligibility = 'ineligible';
  } else if (sideEffectRisk || duplicateRisk) {
    eligibility = 'conditional'; // requires manual operator approval
  } else {
    eligibility = 'eligible';
  }

  return {
    executionId,
    eligibility,
    retryable,
    sideEffectRisk,
    duplicateRisk,
    priorReplayCount,
    failureType,
    sanitizedInputKeys,
    reasons,
    assessedAt: new Date().toISOString(),
  };
}

/** Increment the replay counter on the execution record */
export async function markReplayed(executionId: string) {
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    select: { metadata: true },
  });

  const meta            = (execution?.metadata as Record<string, unknown>) ?? {};
  const priorReplayCount = Number(meta.replayCount ?? 0);

  await prisma.agentExecution.update({
    where: { id: executionId },
    data: {
      metadata: {
        ...meta,
        replayCount:  priorReplayCount + 1,
        lastReplayAt: new Date().toISOString(),
      },
    },
  });
}

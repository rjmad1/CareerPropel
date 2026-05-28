import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { getProviderHealthReport } from '@/lib/observability/provider-health';

const replayAuditLogger = createLogger({ component: 'replay-audit' });

export interface ReplayAuditInput {
  operatorEmail: string;
  executionId: string;
  reason: string;
  source: string; // e.g., 'admin-console', 'auto-recovery'
  result: 'success' | 'failed';
  duplicateSuppression: boolean;
  errorMessage?: string;
}

/**
 * Persists a detailed replay audit entry to the immutable platform audit ledger.
 */
export async function logReplayAction(input: ReplayAuditInput): Promise<void> {
  const providerId = 'anthropic';
  const providerHealth = getProviderHealthReport(providerId);

  const auditDetails = {
    executionId: input.executionId,
    reason: input.reason,
    source: input.source,
    result: input.result,
    duplicateSuppression: input.duplicateSuppression,
    providerHealthSnapshot: {
      providerId,
      status: providerHealth.status,
      degradationScore: providerHealth.degradationScore,
      failureRate: providerHealth.failureRate,
      p95LatencyMs: providerHealth.p95LatencyMs,
    },
    errorMessage: input.errorMessage || null,
    auditedAt: new Date().toISOString(),
  };

  try {
    await prisma.auditLog.create({
      data: {
        email: input.operatorEmail,
        action: 'EXECUTION_REPLAY',
        resource: 'execution',
        resourceId: input.executionId,
        details: auditDetails as any,
        status: input.result === 'success' ? 'success' : 'failure',
        severity: input.result === 'success' ? 'info' : 'warning',
      },
    });

    replayAuditLogger.info(
      { executionId: input.executionId, operator: input.operatorEmail, result: input.result },
      'Replay action audited and logged to platform audit ledger'
    );
  } catch (error) {
    replayAuditLogger.error(
      { err: error, executionId: input.executionId },
      'Failed to log replay action to platform audit ledger'
    );
  }
}

/**
 * Retrieves the full replay history for a given execution ID from the audit log.
 */
export async function getReplayHistory(executionId: string) {
  return prisma.auditLog.findMany({
    where: {
      resource: 'execution',
      resourceId: executionId,
      action: 'EXECUTION_REPLAY',
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Retrieves all replay audit records across the platform.
 */
export async function getAllReplayAudits(limit = 100) {
  return prisma.auditLog.findMany({
    where: {
      action: 'EXECUTION_REPLAY',
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

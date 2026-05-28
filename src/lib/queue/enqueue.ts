import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import { getCostCeiling, getProjectedCost } from '@/lib/agents/policies/cost-config';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import crypto from 'crypto';
import {
  generateIdempotencyKey,
  checkIdempotency,
  storeIdempotency,
} from './idempotency';
import { enqueueExecution } from './queues';
import { evaluateAdmission } from './admission-control';

export async function enqueueAgentExecution(
  agentType: string,
  userId: string,
  context: Record<string, unknown>,
  idempotencyKey?: string,
): Promise<string> {
  const iKey = idempotencyKey ?? generateIdempotencyKey(userId, agentType, context);

  // Deduplication check
  const existing = await checkIdempotency(iKey);
  if (existing) {
    log.info({ executionId: existing, agentType, userId }, 'Returning existing execution (idempotency hit)');
    return existing;
  }

  // Enforce Queue Admission Control
  const admission = await evaluateAdmission(userId, agentType);
  if (!admission.allowed) {
    throw Object.assign(
      new Error(`Admission Control Rejected: ${admission.reason}`),
      { code: 'ADMISSION_REJECTED' }
    );
  }

  // Cost ceiling validation before creating any DB record
  const estimatedTokens = Math.ceil(JSON.stringify(context).length / 4);
  const projectedCost = getProjectedCost(agentType, estimatedTokens);
  const ceiling = getCostCeiling(agentType);
  if (projectedCost > ceiling) {
    throw Object.assign(
      new Error(`Projected cost $${projectedCost.toFixed(4)} exceeds ceiling $${ceiling} for ${agentType}`),
      { code: 'COST_CEILING_EXCEEDED' },
    );
  }

  const deployment = getDeploymentMetadata();

  const correlationId = typeof context.correlationId === 'string' ? context.correlationId : `corr-${crypto.randomUUID()}`;
  const requestId = typeof context.requestId === 'string' ? context.requestId : `req-${crypto.randomUUID()}`;

  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType,
      jobId: typeof context.jobId === 'string' ? context.jobId : null,
      status: 'queued',
      input: JSON.stringify(context),
      executionSource: 'queue',
      queuedAt: new Date(),
      estimatedCost: projectedCost,
      correlationId,
      requestId,
      deploymentVersion: deployment.deploymentVersion,
      deploymentSha: deployment.deploymentSha,
      deploymentEnvironment: deployment.deploymentEnvironment,
      railwayServiceId: deployment.railwayServiceId,
      deploymentTimestamp: new Date(deployment.deploymentTimestamp),
      previousDeploymentVersion: deployment.previousDeploymentVersion,
    },
  });

  await storeIdempotency(iKey, execution.id);

  const promptContext: Record<string, string | undefined> = {};
  for (const [key, val] of Object.entries(context)) {
    promptContext[key] = val !== null && val !== undefined ? String(val) : undefined;
  }

  await enqueueExecution({
    executionId: execution.id,
    userId,
    agentType,
    promptContext,
    requestId,
    correlationId,
    submittedAt: new Date().toISOString(),
    jobId: typeof context.jobId === 'string' ? context.jobId : undefined,
  });

  log.info({ executionId: execution.id, agentType, userId }, 'Agent execution enqueued');
  return execution.id;
}

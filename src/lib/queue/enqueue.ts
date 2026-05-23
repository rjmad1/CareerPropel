import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import { getCostCeiling, getProjectedCost } from '@/lib/agents/cost-config';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import {
  generateIdempotencyKey,
  checkIdempotency,
  storeIdempotency,
} from './idempotency';
import {
  getAgentQueue,
  JOB_DEFAULTS,
  SCHEMA_VERSION,
  EXECUTION_VERSION,
} from './job-definitions';

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

  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType,
      status: 'queued',
      input: JSON.stringify(context),
      executionSource: 'queue',
      queuedAt: new Date(),
      estimatedCost: projectedCost,
      deploymentVersion: deployment.deploymentVersion,
      deploymentSha: deployment.deploymentSha,
      deploymentEnvironment: deployment.deploymentEnvironment,
      railwayServiceId: deployment.railwayServiceId,
      deploymentTimestamp: new Date(deployment.deploymentTimestamp),
      previousDeploymentVersion: deployment.previousDeploymentVersion,
    },
  });

  await storeIdempotency(iKey, execution.id);

  await getAgentQueue().add(
    'agent-execution',
    {
      executionId: execution.id,
      agentType,
      userId,
      context,
      idempotencyKey: iKey,
      schemaVersion: SCHEMA_VERSION,
      executionVersion: EXECUTION_VERSION,
    },
    JOB_DEFAULTS,
  );

  log.info({ executionId: execution.id, agentType, userId }, 'Agent execution enqueued');
  return execution.id;
}

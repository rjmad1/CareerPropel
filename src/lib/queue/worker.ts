import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { streamLLM } from '@/lib/llm/provider';
import {
  getAgentSystemPrompt,
  buildAgentUserPrompt,
} from '@/lib/agents/prompts';
import { buildAgentContext } from '@/lib/agents/contextBuilder';
import { critiqueOutput } from '@/lib/agents/criticPrompt';
import { checkChainDependencies, mergeUpstreamContext } from '@/lib/agents/chainExecutor';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
  ExtendedAgentType,
} from '@/lib/agents/redis-integration';
import { log } from '@/lib/logging/logger';
import { getCostCeiling, getProjectedCost } from '@/lib/agents/cost-config';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import type { AgentType } from '@/lib/agents/prompts';
import {
  AgentJobData,
  AGENT_QUEUE_NAME,
  WORKER_CONFIG,
  DRAIN_TIMEOUT_MS,
  HEALTH_CHECK_INTERVAL,
  createBullMQRedisConnection,
  getAgentQueue,
} from './job-definitions';

const HEARTBEAT_INTERVAL_MS = 10_000;

// Redis connection for heartbeats — separate from the BullMQ worker connection.
const heartbeatRedis = createBullMQRedisConnection();

async function emitHeartbeat(jobId: string, executionId: string, workerId: string): Promise<void> {
  try {
    await heartbeatRedis.setex(
      `heartbeat:${jobId}`,
      30, // 30s TTL — if worker dies, key expires automatically
      JSON.stringify({ workerId, jobId, executionId, ts: Date.now() }),
    );
  } catch (err) {
    log.warn({ err, jobId }, 'Heartbeat emit failed');
  }
}

async function validateCostCeiling(
  agentType: string,
  context: Record<string, unknown>,
  retryCount: number,
): Promise<number> {
  const estimatedTokens = Math.ceil(JSON.stringify(context).length / 4);
  const projected = getProjectedCost(agentType, estimatedTokens, retryCount > 0);
  const ceiling = getCostCeiling(agentType);
  if (projected > ceiling) {
    throw Object.assign(
      new Error(`Cost ceiling exceeded: projected $${projected.toFixed(4)} > ceiling $${ceiling}`),
      { code: 'COST_CEILING_EXCEEDED', failureClassification: 'cost_ceiling' as const },
    );
  }
  return projected;
}

interface RetryAttempt {
  attempt: number;
  provider: string;
  model: string;
  tokenUsage: { inputTokens: number; outputTokens: number };
  cost: number;
  latencyMs: number;
  failureReason?: string;
}

async function appendRetryLineage(executionId: string, attempt: RetryAttempt): Promise<void> {
  try {
    const current = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      select: { retryLineage: true },
    });
    const lineage = Array.isArray(current?.retryLineage) ? (current?.retryLineage ?? []) : [];
    lineage.push({ ...attempt, ts: new Date().toISOString() });
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: { retryLineage: lineage as unknown as import('@prisma/client').Prisma.InputJsonValue },
    });
  } catch (err) {
    log.warn({ err, executionId }, 'Failed to append retry lineage');
  }
}

async function processAgentJob(job: Job<AgentJobData>, workerId: string): Promise<void> {
  const { executionId, agentType, userId, context: rawContext } = job.data;
  // mutableContext may be widened by chain-dep merging before the LLM call
  let mutableContext: Record<string, unknown> = rawContext as Record<string, unknown>;
  const jobLog = log.child({ executionId, agentType, userId, jobId: job.id, workerId });

  // Check for duplicate execution (e.g. job redelivered after crash)
  const existing = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    select: { status: true, retryCount: true },
  });
  if (!existing) {
    jobLog.error('Execution record not found — skipping job');
    return;
  }
  if (existing.status === 'completed') {
    jobLog.warn('Duplicate delivery — execution already completed, skipping');
    return;
  }

  const retryCount = existing.retryCount;

  // Cost ceiling — fail-fast before touching the LLM
  let estimatedCost: number;
  try {
    estimatedCost = await validateCostCeiling(agentType, mutableContext, retryCount);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: msg,
        failureClassification: 'cost_ceiling',
      },
    });
    throw err; // surface to BullMQ so it records the failure
  }

  const deployment = getDeploymentMetadata();

  await prisma.agentExecution.update({
    where: { id: executionId },
    data: {
      status: 'running',
      startedAt: new Date(),
      workerId,
      estimatedCost,
      deploymentVersion: deployment.deploymentVersion,
      deploymentSha: deployment.deploymentSha,
      deploymentEnvironment: deployment.deploymentEnvironment,
      railwayServiceId: deployment.railwayServiceId,
      retryCount: retryCount + (job.attemptsMade > 0 ? 1 : 0),
    },
  });

  const jobId = job.id ?? executionId;
  const heartbeatTimer = setInterval(
    () => emitHeartbeat(jobId, executionId, workerId),
    HEARTBEAT_INTERVAL_MS,
  );

  await publishAgentStarted(userId, executionId, agentType as ExtendedAgentType, mutableContext);
  await publishAgentStatus(userId, executionId, agentType as ExtendedAgentType, 'running', 0, `Starting ${agentType}...`);

  let fullResponse = '';
  let tokenCount = 0;
  const startTime = Date.now();
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort(new Error(`LLM stream timed out after 55s`));
  }, 55_000);

  // enrichedContext is declared here so the critic gate below can reference it
  let enrichedContext: Awaited<ReturnType<typeof buildAgentContext>> = {};

  try {
    // Check multi-agent chain dependencies before touching the LLM
    const pipelineJobId = (mutableContext.jobId) as string | undefined;
    if (pipelineJobId) {
      const chain = await checkChainDependencies(agentType as AgentType, userId, pipelineJobId);
      if (!chain.ready) {
        jobLog.info({ pendingDeps: chain.pendingDeps }, 'Chain deps not satisfied — requeueing');
        const originalJobId = job.data.originalJobId ?? job.id;
        await getAgentQueue().add(
          'agent-execution',
          { ...job.data, originalJobId },
          { delay: 60_000, jobId: `dep-wait-${originalJobId}` },
        );
        await prisma.agentExecution.update({
          where: { id: executionId },
          data: { status: 'queued', errorMessage: `Waiting for: ${chain.pendingDeps.join(', ')}` },
        });
        return;
      }
      mutableContext = mergeUpstreamContext(agentType as AgentType, mutableContext, chain.upstreamOutputs);
    }

    // Enrich context with real candidate data so agents never see placeholder text
    enrichedContext = await buildAgentContext({
      userId,
      jobId: pipelineJobId,
      overrides: mutableContext as import('@/lib/agents/prompts').AgentPromptContext,
    });

    const systemPrompt = getAgentSystemPrompt(agentType as AgentType);
    const userPrompt = buildAgentUserPrompt(agentType as AgentType, enrichedContext);

    for await (const token of streamLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 4096,
        signal: abortController.signal,
      } as Parameters<typeof streamLLM>[1] & { signal?: AbortSignal },
    )) {
      if (abortController.signal.aborted) throw abortController.signal.reason;
      fullResponse += token;
      tokenCount++;
    }
  } catch (streamErr: unknown) {
    clearTimeout(timeoutHandle);
    clearInterval(heartbeatTimer);
    const latencyMs = Date.now() - startTime;
    const errObj = streamErr as { code?: string; name?: string; message?: string };
    let failureClassification: 'cost_ceiling' | 'timeout' | 'provider_error';
    if (errObj?.code === 'COST_CEILING_EXCEEDED') {
      failureClassification = 'cost_ceiling';
    } else if (errObj?.name === 'AbortError' || errObj?.message?.includes('timed out')) {
      failureClassification = 'timeout';
    } else {
      failureClassification = 'provider_error';
    }

    await appendRetryLineage(executionId, {
      attempt: job.attemptsMade,
      provider: 'unknown',
      model: 'unknown',
      tokenUsage: { inputTokens: 0, outputTokens: tokenCount },
      cost: 0,
      latencyMs,
      failureReason: errObj.message ?? String(streamErr),
    });

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: errObj.message ?? String(streamErr),
        failureClassification,
        latencyMs,
      },
    });
    await publishAgentStatus(userId, executionId, agentType as ExtendedAgentType, 'failed', 0, 'Failed');
    throw streamErr;
  } finally {
    clearTimeout(timeoutHandle);
    clearInterval(heartbeatTimer);
  }

  const latencyMs = Date.now() - startTime;

  // Critic quality-gate — runs before persistence
  const userPromptForCritic = buildAgentUserPrompt(agentType as AgentType, enrichedContext);
  const criticResult = await critiqueOutput(agentType as AgentType, userPromptForCritic, fullResponse);

  if (!criticResult.accepted) {
    jobLog.warn(
      { score: criticResult.score, rationale: criticResult.rationale },
      'Critic rejected agent output — marking failed'
    );
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: `Quality gate failed (score ${criticResult.score}/10): ${criticResult.rationale}`,
        failureClassification: 'validation_error',
        latencyMs,
        output: JSON.stringify({ criticResult, rawResponse: fullResponse }),
      },
    });
    await publishAgentStatus(userId, executionId, agentType as ExtendedAgentType, 'failed', 0, 'Quality gate failed');
    return;
  }

  // Parse JSON output
  let parsedOutput: Record<string, unknown> = {};
  try {
    const match = /\{[\s\S]*\}/u.exec(fullResponse);
    parsedOutput = match ? JSON.parse(match[0]) : { rawResponse: fullResponse };
  } catch {
    parsedOutput = { rawResponse: fullResponse };
  }
  // Attach critic metadata to output for observability
  parsedOutput._critic = { score: criticResult.score, rationale: criticResult.rationale };

  // Rough cost from actual token count
  const actualCost = getProjectedCost(agentType, tokenCount, retryCount > 0);

  await prisma.agentExecution.update({
    where: { id: executionId },
    data: {
      status: 'completed',
      completedAt: new Date(),
      output: JSON.stringify(parsedOutput),
      tokenCount,
      durationMs: latencyMs,
      latencyMs,
      actualCost,
      tokenUsage: { inputTokens: 0, outputTokens: tokenCount },
    },
  });

  await appendRetryLineage(executionId, {
    attempt: job.attemptsMade,
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',
    tokenUsage: { inputTokens: 0, outputTokens: tokenCount },
    cost: actualCost,
    latencyMs,
  });

  await publishAgentCompleted(userId, executionId, agentType as ExtendedAgentType, 'success',
    parsedOutput, undefined, tokenCount, latencyMs);
  await publishAgentStatus(userId, executionId, agentType as ExtendedAgentType, 'completed', 0, 'Complete', tokenCount);

  jobLog.info({ tokenCount, latencyMs, actualCost }, 'Agent job completed');
}

export function startWorker(): { worker: Worker<AgentJobData>; workerId: string } {
  const workerId = `worker-${process.pid}-${Date.now()}`;
  const deployment = getDeploymentMetadata();

  log.info({ workerId, ...deployment }, 'BullMQ worker starting');

  const worker = new Worker<AgentJobData>(
    AGENT_QUEUE_NAME,
    (job) => processAgentJob(job, workerId),
    {
      connection: createBullMQRedisConnection(),
      ...WORKER_CONFIG,
    },
  );

  worker.on('completed', (job) => {
    log.info({ jobId: job.id, executionId: job.data.executionId }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    log.error({ jobId: job?.id, err }, 'Job failed');
  });

  worker.on('error', (err) => {
    log.error({ err }, 'Worker error');
  });

  // Shutdown is coordinated externally by bin/worker.ts.
  // Call worker.close() directly or use drainAndClose() for graceful drain.

  return { worker, workerId };
}

/**
 * Gracefully drain and close the agent worker.
 * Poll actual active-job count; wait up to DRAIN_TIMEOUT_MS before forcing close.
 */
export async function drainAndCloseAgentWorker(
  worker: Worker<AgentJobData>,
  workerId: string,
): Promise<void> {
  log.info({ workerId }, 'Agent worker draining');
  await worker.pause();

  const drainDeadline = Date.now() + DRAIN_TIMEOUT_MS;
  await new Promise<void>((resolve) => {
    const checkInterval = setInterval(async () => {
      try {
        const counts = await getAgentQueue().getJobCounts('active');
        const active = counts.active ?? 0;
        if (active === 0 || Date.now() >= drainDeadline) {
          clearInterval(checkInterval);
          resolve();
        } else {
          log.info({ active, remainingMs: drainDeadline - Date.now() }, 'Agent drain in progress');
        }
      } catch (err) {
        log.error({ err }, 'Error during agent drain check');
        if (Date.now() >= drainDeadline) {
          clearInterval(checkInterval);
          resolve();
        }
      }
    }, HEALTH_CHECK_INTERVAL);
  });

  await worker.close();
  log.info({ workerId }, 'Agent worker drained and closed');
}

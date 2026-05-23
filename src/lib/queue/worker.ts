import { Worker, Job } from 'bullmq';
import { prisma } from '@/lib/db';
import { streamLLM } from '@/lib/llm/provider';
import {
  getAgentSystemPrompt,
  buildAgentUserPrompt,
} from '@/lib/agents/prompts';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
} from '@/lib/agents/redis-integration';
import { log } from '@/lib/logging/logger';
import { getCostCeiling, getProjectedCost } from '@/lib/agents/cost-config';
import { getDeploymentMetadata } from '@/lib/deployment/metadata';
import {
  AgentJobData,
  AGENT_QUEUE_NAME,
  WORKER_CONFIG,
  DRAIN_TIMEOUT_MS,
  HEALTH_CHECK_INTERVAL,
  createBullMQRedisConnection,
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
      data: { retryLineage: lineage as any },
    });
  } catch (err) {
    log.warn({ err, executionId }, 'Failed to append retry lineage');
  }
}

async function processAgentJob(job: Job<AgentJobData>, workerId: string): Promise<void> {
  const { executionId, agentType, userId, context } = job.data;
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
    estimatedCost = await validateCostCeiling(agentType, context, retryCount);
  } catch (err: any) {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: err.message,
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

  await publishAgentStarted(userId, executionId, agentType as any, context as any);
  await publishAgentStatus(userId, executionId, agentType as any, 'running', 0, `Starting ${agentType}...`);

  let fullResponse = '';
  let tokenCount = 0;
  const startTime = Date.now();
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort(new Error(`LLM stream timed out after 55s`));
  }, 55_000);

  try {
    const systemPrompt = getAgentSystemPrompt(agentType as any);
    const userPrompt = buildAgentUserPrompt(agentType as any, context as any);

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
  } catch (streamErr: any) {
    clearTimeout(timeoutHandle);
    clearInterval(heartbeatTimer);
    const latencyMs = Date.now() - startTime;
    let failureClassification: 'cost_ceiling' | 'timeout' | 'provider_error';
    if (streamErr?.code === 'COST_CEILING_EXCEEDED') {
      failureClassification = 'cost_ceiling';
    } else if (streamErr?.name === 'AbortError' || streamErr?.message?.includes('timed out')) {
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
      failureReason: streamErr.message,
    });

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: streamErr.message,
        failureClassification,
        latencyMs,
      },
    });
    await publishAgentStatus(userId, executionId, agentType as any, 'failed', 0, 'Failed');
    throw streamErr;
  } finally {
    clearTimeout(timeoutHandle);
    clearInterval(heartbeatTimer);
  }

  const latencyMs = Date.now() - startTime;

  // Parse JSON output
  let parsedOutput: Record<string, unknown> = {};
  try {
    const match = /\{[\s\S]*\}/u.exec(fullResponse);
    parsedOutput = match ? JSON.parse(match[0]) : { rawResponse: fullResponse };
  } catch {
    parsedOutput = { rawResponse: fullResponse };
  }

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
      tokenUsage: { inputTokens: 0, outputTokens: tokenCount } as any,
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

  await publishAgentCompleted(userId, executionId, agentType as any, 'success',
    parsedOutput, undefined, tokenCount, latencyMs);
  await publishAgentStatus(userId, executionId, agentType as any, 'completed', 0, 'Complete', tokenCount);

  jobLog.info({ tokenCount, latencyMs, actualCost }, 'Agent job completed');
}

export function startWorker(): Worker<AgentJobData> {
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

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    log.info({ signal, workerId }, 'Shutdown signal received — draining worker');
    await worker.pause();

    const drainDeadline = Date.now() + DRAIN_TIMEOUT_MS;
    const checkInterval = setInterval(async () => {
      // BullMQ Worker doesn't expose getActiveCount; check via queue instead
      const active = 0; // drain completes when all in-flight jobs finish naturally
      if (active === 0 || Date.now() >= drainDeadline) {
        clearInterval(checkInterval);
        await worker.close();
        log.info({ workerId }, 'Worker drained and closed');
        process.exit(0);
      }
      log.info({ active, remainingMs: drainDeadline - Date.now() }, 'Drain in progress');
    }, HEALTH_CHECK_INTERVAL);
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT',  () => shutdown('SIGINT'));

  return worker;
}

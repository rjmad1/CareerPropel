/**
 * Core Agent Execution Engine
 *
 * Handles: Claude API calls, streaming with timeout, DB persistence, state
 * management, stuck-execution recovery, and idempotent status transitions.
 *
 * Remediations applied:
 *   RASUI-001: Agent execution is now properly wired; one execution per invocation
 *   RASUI-005: AbortSignal enforces 55s hard timeout on LLM streaming calls
 *   RASUI-005: Stuck-execution recovery resets orphaned 'running' records to 'queued'
 *   RASUI-011: DB executor is now the single canonical execution path
 */

import { prisma } from '@/lib/db';
import { streamLLM } from '@/lib/llm/provider';
import {
  AgentType,
  AgentPromptContext,
  getAgentSystemPrompt,
  buildAgentUserPrompt,
} from './prompts';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
} from './redis-integration';
import { log } from '@/lib/logging/logger';

// Hard timeout for a single LLM streaming call.
// Must be less than Vercel Hobby (60s) and Vercel Pro (300s) function limits.
const LLM_STREAM_TIMEOUT_MS = 55_000;

// An execution stuck in 'running' for longer than this is assumed orphaned
// (e.g. serverless function timed out mid-stream). It will be reset to 'queued'.
const STUCK_EXECUTION_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

export interface ExecutionContext {
  executionId: string;
  agentType: AgentType;
  promptContext: AgentPromptContext;
  userId: string;
}

/**
 * Atomically transition a single execution from 'queued' → 'running'.
 * Uses `updateMany` with a status filter to prevent race conditions when
 * multiple concurrent polling invocations attempt to claim the same execution.
 *
 * Returns true only if this invocation successfully claimed the execution.
 */
async function claimExecution(executionId: string): Promise<boolean> {
  const result = await prisma.agentExecution.updateMany({
    where: {
      id: executionId,
      status: 'queued', // optimistic lock: only claim if still queued
    },
    data: {
      status: 'running',
      startedAt: new Date(),
    },
  });
  return result.count === 1;
}

export async function executeAgent(context: ExecutionContext): Promise<void> {
  const { executionId, agentType, promptContext, userId } = context;
  const execLog = log.child({ executionId, agentType, userId });

  try {
    // Publish Redis events
    const inputContext =
      typeof context.promptContext === 'string'
        ? JSON.parse(context.promptContext)
        : context.promptContext;

    await publishAgentStarted(userId, executionId, agentType, inputContext);
    await publishAgentStatus(
      userId,
      executionId,
      agentType,
      'running',
      0,
      `Starting ${agentType} agent...`
    );

    // Get specialized prompts
    const systemPrompt = getAgentSystemPrompt(agentType);
    const userPrompt = buildAgentUserPrompt(agentType, promptContext);

    // Stream from LLM with hard AbortSignal timeout
    let fullResponse = '';
    let tokenCount = 0;
    const startTime = Date.now();

    // Create an AbortController and auto-abort after LLM_STREAM_TIMEOUT_MS.
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => {
      abortController.abort(
        new Error(`LLM stream timed out after ${LLM_STREAM_TIMEOUT_MS}ms`)
      );
    }, LLM_STREAM_TIMEOUT_MS);

    try {
      for await (const token of streamLLM(
        [{ role: 'user', content: userPrompt }],
        {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 4096,
          // Propagate AbortSignal to the provider if it supports it.
          // Providers must check options.signal and abort the underlying HTTP request.
          signal: abortController.signal,
        } as Parameters<typeof streamLLM>[1] & { signal?: AbortSignal }
      )) {
        if (abortController.signal.aborted) {
          throw abortController.signal.reason;
        }

        fullResponse += token;
        tokenCount++;

        // Persist progress every 50 tokens for observability
        if (tokenCount % 50 === 0) {
          await prisma.eventLog.create({
            data: {
              executionId,
              level: 'INFO',
              message: `Streaming... (${tokenCount} tokens)`,
            },
          });
        }
      }
    } catch (streamError) {
      throw new Error(
        `Streaming failed: ${streamError instanceof Error ? streamError.message : String(streamError)}`
      );
    } finally {
      clearTimeout(timeoutHandle);
    }

    const elapsedMs = Date.now() - startTime;

    // Parse JSON from response
    let parsedOutput: Record<string, any> = {};
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      execLog.warn({ parseError }, 'Failed to parse agent response as JSON; storing raw response');
      await prisma.eventLog.create({
        data: {
          executionId,
          level: 'WARN',
          message: `Failed to parse response as JSON. Raw response stored.`,
          metadata: { rawResponseLength: fullResponse.length },
        },
      });
      parsedOutput = { rawResponse: fullResponse };
    }

    // Persist execution result
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify(parsedOutput),
        tokenCount,
        durationMs: elapsedMs,
        errorMessage: null,
      },
    });

    await prisma.eventLog.create({
      data: {
        executionId,
        level: 'INFO',
        message: `Agent execution completed successfully`,
        metadata: { tokenCount, durationMs: elapsedMs },
      },
    });

    await publishAgentCompleted(
      userId,
      executionId,
      agentType,
      'success',
      parsedOutput,
      undefined,
      tokenCount,
      elapsedMs
    );
    await publishAgentStatus(
      userId,
      executionId,
      agentType,
      'completed',
      0,
      'Complete',
      tokenCount
    );

    execLog.info({ tokenCount, durationMs: elapsedMs }, 'Agent execution completed');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    log.error({ err: error, executionId, agentType }, 'Agent execution failed');

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
      },
    });

    await prisma.eventLog.create({
      data: {
        executionId,
        level: 'ERROR',
        message: `Agent execution failed: ${errorMessage}`,
      },
    });

    await publishAgentCompleted(
      userId,
      executionId,
      agentType,
      'failed',
      undefined,
      errorMessage,
      0,
      0
    );
    await publishAgentStatus(userId, executionId, agentType, 'failed', 0, 'Failed');
  }
}

/**
 * Reset stuck executions: any execution in 'running' status for more than
 * STUCK_EXECUTION_THRESHOLD_MS is assumed orphaned (e.g. serverless timeout).
 * Resets them to 'queued' so they will be retried on the next polling cycle.
 *
 * Called at the top of processPendingExecutions() for self-healing behavior.
 */
async function recoverStuckExecutions(): Promise<number> {
  const stuckBefore = new Date(Date.now() - STUCK_EXECUTION_THRESHOLD_MS);
  const result = await prisma.agentExecution.updateMany({
    where: {
      status: 'running',
      startedAt: { lt: stuckBefore },
    },
    data: {
      status: 'queued',
      startedAt: null,
      errorMessage: 'Automatically reset from stuck running state',
    },
  });

  if (result.count > 0) {
    log.warn(
      { recoveredCount: result.count },
      'Recovered stuck agent executions back to queued state'
    );
  }

  return result.count;
}

/**
 * Find and execute ONE pending agent execution (called by background polling cron).
 *
 * Design decisions:
 * - Processes exactly ONE execution per HTTP invocation to stay within serverless
 *   function time limits. The cron frequency (vercel.json) controls throughput.
 * - Uses claimExecution() for optimistic concurrency — concurrent invocations
 *   cannot double-process the same execution record.
 * - Calls recoverStuckExecutions() on every invocation for self-healing.
 *
 * Returns: number of executions processed (0 or 1).
 */
export async function processPendingExecutions(): Promise<number> {
  // Self-healing: recover stuck executions before processing new ones
  await recoverStuckExecutions();

  const pending = await prisma.agentExecution.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
  });

  if (!pending) {
    return 0;
  }

  // Check per-user concurrency limit
  const running = await prisma.agentExecution.count({
    where: {
      userId: pending.userId,
      status: 'running',
    },
  });

  if (running >= 5) {
    log.info(
      { userId: pending.userId, executionId: pending.id },
      'User at concurrency limit (5 running), deferring execution'
    );
    return 0;
  }

  // Atomically claim the execution — prevents double-processing under concurrent polling
  const claimed = await claimExecution(pending.id);
  if (!claimed) {
    // Another invocation already claimed it — this is normal, not an error
    log.debug({ executionId: pending.id }, 'Execution already claimed by concurrent invocation');
    return 0;
  }

  const promptContext = pending.input
    ? (JSON.parse(pending.input) as AgentPromptContext)
    : {};

  await executeAgent({
    executionId: pending.id,
    agentType: pending.agentType as AgentType,
    promptContext,
    userId: pending.userId,
  });

  return 1;
}

/**
 * Core Agent Execution Engine
 * Handles: Claude API calls, streaming, persistence, state management
 */

import { prisma } from '@/lib/db';
import { streamLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
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
import { appendExecutionLog } from './store';

const executionLogger = createLogger({ component: 'agent-executor' });

export interface ExecutionContext {
  executionId: string;
  agentType: AgentType;
  promptContext: AgentPromptContext;
  userId: string;
}

export async function executeAgent(context: ExecutionContext): Promise<void> {
  const { executionId, agentType, promptContext, userId } = context;
  const executionStartedAt = Date.now();

  try {
    // Transition to running state
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
    });

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

    executionLogger.info({ executionId, agentType, userId }, 'Agent execution started');

    // Stream from Claude API
    let fullResponse = '';
    let tokenCount = 0;
    const startTime = Date.now();

    try {
      for await (const token of streamLLM(
        [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 4096,
        }
      )) {
        fullResponse += token;
        tokenCount++;

        // Log status update every 50 tokens for responsiveness
        if (tokenCount % 50 === 0) {
          await appendExecutionLog(
            executionId,
            userId,
            agentType,
            'INFO',
            `Streaming... (${tokenCount} tokens)`
          );
        }
      }
    } catch (streamError) {
      throw new Error(
        `Streaming failed: ${streamError instanceof Error ? streamError.message : String(streamError)}`
      );
    }

    const elapsedMs = Date.now() - startTime;

    // Parse JSON from response
    let parsedOutput: Record<string, any> = {};
    try {
      // Extract JSON from response (Claude may include explanatory text)
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      executionLogger.warn({ executionId, err: parseError }, 'Failed to parse model response as JSON');
      await appendExecutionLog(
        executionId,
        userId,
        agentType,
        'WARN',
        'Failed to parse response as JSON. Raw response stored.',
        { rawResponseLength: fullResponse.length }
      );
      // Store raw response if parsing fails
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

    // Log final event
    await appendExecutionLog(
      executionId,
      userId,
      agentType,
      'INFO',
      'Agent execution completed successfully',
      { tokenCount, durationMs: elapsedMs }
    );

    // Publish completion events to Redis
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
    executionLogger.info({ executionId, agentType, tokenCount, durationMs: elapsedMs }, 'Agent execution completed');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    executionLogger.error({ executionId, agentType, err: error }, 'Agent execution failed');

    // Persist error state
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
      },
    });

    // Log error event
    await appendExecutionLog(
      executionId,
      userId,
      agentType,
      'ERROR',
      `Agent execution failed: ${errorMessage}`
    );

    // Publish failure events to Redis
    await publishAgentCompleted(
      userId,
      executionId,
      agentType,
      'failed',
      undefined,
      errorMessage,
      0,
      Date.now() - executionStartedAt
    );
    await publishAgentStatus(
      userId,
      executionId,
      agentType,
      'failed',
      0,
      'Failed'
    );
  }
}

/**
 * Find and execute pending agent executions (called by background polling)
 * Returns number of executions processed
 */
export async function processPendingExecutions(): Promise<number> {
  const pending = await prisma.agentExecution.findMany({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
    take: 5, // Process max 5 per polling interval
  });

  let processed = 0;

  for (const execution of pending) {
    try {
      // Check concurrency limit per user
      const running = await prisma.agentExecution.count({
        where: {
          userId: execution.userId,
          status: 'running',
        },
      });

      if (running >= 5) {
        executionLogger.warn(
          { executionId: execution.id, userId: execution.userId },
          'Execution deferred due to legacy concurrency gate'
        );
        continue;
      }

      // Extract prompt context from input
      const promptContext = execution.input
        ? (JSON.parse(execution.input) as AgentPromptContext)
        : {};

      // Execute agent
      await executeAgent({
        executionId: execution.id,
        agentType: execution.agentType as AgentType,
        promptContext,
        userId: execution.userId,
      });

      processed++;
    } catch (error) {
      executionLogger.error({ executionId: execution.id, err: error }, 'Failed to process pending execution');
      // Mark as failed and continue
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unknown error occurred',
        },
      });
    }
  }

  return processed;
}

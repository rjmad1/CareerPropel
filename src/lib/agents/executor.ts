/**
 * Core Agent Execution Engine
 * Handles: Claude API calls, streaming, persistence, state management
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

export interface ExecutionContext {
  executionId: string;
  agentType: AgentType;
  promptContext: AgentPromptContext;
  userId: string;
}

export async function executeAgent(context: ExecutionContext): Promise<void> {
  const { executionId, agentType, promptContext, userId } = context;

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
      console.error(`[Executor] Parse error for ${executionId}:`, parseError);
      await prisma.eventLog.create({
        data: {
          executionId,
          level: 'WARN',
          message: `Failed to parse response as JSON. Raw response stored.`,
          metadata: { rawResponseLength: fullResponse.length },
        },
      });
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
    await prisma.eventLog.create({
      data: {
        executionId,
        level: 'INFO',
        message: `Agent execution completed successfully`,
        metadata: { tokenCount, durationMs: elapsedMs },
      },
    });

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
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    console.error(`[Executor] Execution failed for ${executionId}:`, error);

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
    await prisma.eventLog.create({
      data: {
        executionId,
        level: 'ERROR',
        message: `Agent execution failed: ${errorMessage}`,
      },
    });

    // Publish failure events to Redis
    await publishAgentCompleted(
      userId,
      executionId,
      agentType,
      'failed',
      undefined,
      errorMessage,
      0,
      Date.now() - Date.parse(new Date().toISOString())
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
        console.log(
          `[Executor] User ${execution.userId} at concurrency limit (5), deferring execution ${execution.id}`
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
      console.error(
        `[Executor] Failed to process execution ${execution.id}:`,
        error
      );
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

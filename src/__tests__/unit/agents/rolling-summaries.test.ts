/**
 * @jest-environment node
 */

import { prisma } from '@/lib/db';
import { appendExecutionLog } from '@/lib/agents/core/store';
import { callLLM } from '@/lib/llm/provider';

// Mock the LLM provider callLLM method
jest.mock('@/lib/llm/provider', () => ({
  callLLM: jest.fn(() =>
    Promise.resolve({
      content: 'Execution logs show startup and first tasks successfully completed.',
      stopReason: 'end_turn',
      inputTokens: 50,
      outputTokens: 50,
      totalTokens: 100,
    })
  ),
  getLLMProvider: jest.fn(() => ({
    name: 'anthropic',
    getDefaultModel: () => 'claude-sonnet-4-6',
  })),
}));

// Mock the events publisher
jest.mock('@/lib/queue/events', () => ({
  publishRealtimeEvent: jest.fn().mockResolvedValue(undefined),
}));

describe('Rolling Summaries boundary checks', () => {
  let executionId: string;
  const userId = 'test-user-999';

  beforeEach(async () => {
    // Create an agent execution record
    const execution = await prisma.agentExecution.create({
      data: {
        userId,
        agentType: 'resume-tailor',
        status: 'running',
        input: '{}',
      },
    });
    executionId = execution.id;
  });

  afterEach(async () => {
    // Clean up
    await prisma.eventLog.deleteMany({
      where: { executionId },
    });
    await prisma.agentExecution.deleteMany({
      where: { id: executionId },
    });
  });

  it('does not summarize when logs are fewer than 20', async () => {
    for (let i = 0; i < 5; i++) {
      await appendExecutionLog(executionId, userId, 'resume-tailor', 'INFO', `Log entry ${i}`);
    }

    const count = await prisma.eventLog.count({
      where: { executionId },
    });

    expect(count).toBe(5);
    expect(callLLM).not.toHaveBeenCalled();
  });

  it('triggers rolling summarization when logs cross 20 entries', async () => {
    // Insert 19 logs manually/via append
    for (let i = 0; i < 19; i++) {
      await appendExecutionLog(executionId, userId, 'resume-tailor', 'INFO', `Log entry ${i}`);
    }

    // The 20th log should trigger the background summarization
    await appendExecutionLog(executionId, userId, 'resume-tailor', 'INFO', 'The final trigger log');

    // Wait a brief moment for the background promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Verify count drops to 1 (the new summary log)
    const count = await prisma.eventLog.count({
      where: { executionId },
    });

    // It should have deleted the 20 logs and created 1 summary log
    expect(count).toBe(1);

    const logs = await prisma.eventLog.findMany({
      where: { executionId },
    });

    expect(logs[0].message).toContain('[Rolling Summary]');
    expect(logs[0].message).toContain('Execution logs show startup and first tasks successfully completed.');
    expect(callLLM).toHaveBeenCalled();
  });
});

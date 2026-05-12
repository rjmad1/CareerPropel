/**
 * Agent Execution API Client
 * Handles communication with the agent execution endpoints
 */

import { AgentType } from '@/lib/agents/prompts';

export interface AgentExecutionRequest {
  agentType: AgentType;
  context: Record<string, string | undefined>;
}

export interface AgentExecutionResponse {
  executionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress?: number;
  currentTask?: string;
  output?: Record<string, any>;
  tokenCount?: number;
  durationMs?: number;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
}

export class AgentExecutionClient {
  private baseUrl: string;

  constructor(baseUrl: string = typeof window !== 'undefined' ? window.location.origin : '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Trigger a new agent execution
   */
  async executeAgent(request: AgentExecutionRequest): Promise<AgentExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/api/agents/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger agent execution');
    }

    return response.json();
  }

  /**
   * Poll execution status
   */
  async getExecutionStatus(executionId: string): Promise<AgentExecutionResponse> {
    const response = await fetch(`${this.baseUrl}/api/agents/execute?executionId=${executionId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch execution status');
    }

    return response.json();
  }

  /**
   * Poll with exponential backoff until execution completes
   */
  async waitForCompletion(
    executionId: string,
    maxWaitMs: number = 60000,
    initialDelayMs: number = 500
  ): Promise<AgentExecutionResponse> {
    const startTime = Date.now();
    let delayMs = initialDelayMs;

    while (Date.now() - startTime < maxWaitMs) {
      try {
        const status = await this.getExecutionStatus(executionId);

        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        // Exponential backoff with jitter
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs = Math.min(delayMs * 1.5, 5000) + Math.random() * 500;
      } catch (error) {
        console.error('Error polling execution status:', error);
        // Continue polling on error
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    throw new Error(`Execution ${executionId} did not complete within ${maxWaitMs}ms`);
  }
}

// Singleton instance
let clientInstance: AgentExecutionClient | null = null;

export function getAgentClient(): AgentExecutionClient {
  if (!clientInstance) {
    clientInstance = new AgentExecutionClient();
  }
  return clientInstance;
}

import { AgentExecution, ToolCall, EventLog } from '@/types/agent';

/**
 * Agent Service - API client for agent execution operations
 * 
 * Handles:
 * - Fetching execution details with tool calls and logs
 * - Execution state mutations (pause, resume, cancel)
 * - Log pagination and filtering
 * - WebSocket subscription management
 */

export interface AgentExecutionResponse {
  execution: AgentExecution;
  toolCalls: ToolCall[];
  logs: EventLog[];
  totalLogs: number;
}

export interface LogsResponse {
  logs: EventLog[];
  total: number;
  hasMore: boolean;
  page: number;
}

/**
 * Fetch complete execution with all tool calls and logs
 */
export async function getAgentExecution(
  executionId: string,
  options?: { includeToolCalls?: boolean; includeEvents?: boolean }
): Promise<AgentExecutionResponse> {
  const params = new URLSearchParams();
  if (options?.includeToolCalls === false) params.append('excludeTools', 'true');
  if (options?.includeEvents === false) params.append('excludeEvents', 'true');

  const res = await fetch(`/api/agent/execution/${executionId}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Execution not found');
    throw new Error(`Failed to fetch execution: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch paginated logs for an execution
 */
export async function getAgentLogs(
  executionId: string,
  options?: {
    page?: number;
    pageSize?: number;
    level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  }
): Promise<LogsResponse> {
  const params = new URLSearchParams();
  params.append('page', String(options?.page || 0));
  params.append('pageSize', String(options?.pageSize || 50));
  if (options?.level) params.append('level', options.level);

  const res = await fetch(`/api/agent/execution/${executionId}/logs?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch logs: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Pause a running execution
 */
export async function pauseAgentExecution(executionId: string): Promise<AgentExecution> {
  const res = await fetch(`/api/agent/execution/${executionId}/pause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to pause execution: ${res.statusText}`);
  }

  const data = await res.json();
  return data.execution;
}

/**
 * Resume a paused execution
 */
export async function resumeAgentExecution(executionId: string): Promise<AgentExecution> {
  const res = await fetch(`/api/agent/execution/${executionId}/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to resume execution: ${res.statusText}`);
  }

  const data = await res.json();
  return data.execution;
}

/**
 * Cancel an execution
 */
export async function cancelAgentExecution(executionId: string): Promise<AgentExecution> {
  const res = await fetch(`/api/agent/execution/${executionId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to cancel execution: ${res.statusText}`);
  }

  const data = await res.json();
  return data.execution;
}

/**
 * Subscribe to agent execution updates via EventSource
 * Returns cleanup function to unsubscribe
 */
export function subscribeToAgentExecution(
  executionId: string,
  onUpdate: (event: { type: string; data: unknown }) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const eventSource = new EventSource(`/api/agent/execution/${executionId}/subscribe`);

    eventSource.addEventListener('execution:update', (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate({ type: 'execution:update', data });
      } catch (e) {
        if (onError) onError(new Error('Failed to parse execution update'));
      }
    });

    eventSource.addEventListener('toolcall:complete', (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate({ type: 'toolcall:complete', data });
      } catch (e) {
        if (onError) onError(new Error('Failed to parse tool call update'));
      }
    });

    eventSource.addEventListener('log:new', (event) => {
      try {
        const data = JSON.parse(event.data);
        onUpdate({ type: 'log:new', data });
      } catch (e) {
        if (onError) onError(new Error('Failed to parse log update'));
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
      if (onError) onError(new Error('EventSource connection error'));
    };

    return () => {
      eventSource.close();
    };
  } catch (error) {
    if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
    return () => {}; // no-op cleanup
  }
}

/**
 * Poll for execution updates (fallback when EventSource unavailable)
 * Returns cleanup function
 */
export function pollAgentExecution(
  executionId: string,
  onUpdate: (response: AgentExecutionResponse) => void,
  options?: {
    interval?: number;
    maxAttempts?: number;
    onError?: (error: Error) => void;
  }
): () => void {
  const interval = options?.interval || 2000;
  let attempts = 0;
  const maxAttempts = options?.maxAttempts || Infinity;
  let timeoutId: ReturnType<typeof setTimeout>;

  const poll = async () => {
    try {
      if (attempts >= maxAttempts) {
        return; // Stop polling after max attempts
      }

      const response = await getAgentExecution(executionId);
      onUpdate(response);
      attempts++;

      // Continue polling if execution is running
      if (response.execution.status === 'running' || response.execution.status === 'queued') {
        timeoutId = setTimeout(poll, interval);
      }
    } catch (error) {
      if (options?.onError) {
        options.onError(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
  };
}

/**
 * Get all executions for a candidate
 */
export async function getCandidateExecutions(
  candidateId: string,
  options?: {
    page?: number;
    pageSize?: number;
    status?: string;
  }
): Promise<{
  executions: AgentExecution[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const params = new URLSearchParams();
  params.append('candidateId', candidateId);
  params.append('page', String(options?.page || 0));
  params.append('pageSize', String(options?.pageSize || 20));
  if (options?.status) params.append('status', options.status);

  const res = await fetch(`/api/agent/executions?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch executions: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Format execution duration from milliseconds
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`;
  return `${(milliseconds / 60000).toFixed(1)}m`;
}

/**
 * Calculate execution progress percentage
 */
export function calculateProgress(execution: AgentExecution): number {
  if (execution.status === 'completed') return 100;
  if (execution.status === 'failed') return 0;
  return execution.progress || 0;
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: 'Idle',
    running: 'Running',
    paused: 'Paused',
    completed: 'Completed',
    failed: 'Failed',
  };
  return labels[status] || status;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: 'bg-gray-100 text-gray-700',
    running: 'bg-blue-100 text-blue-700',
    paused: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

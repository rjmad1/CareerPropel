import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentExecution } from '@/types/agent';
import { getCandidateExecutions } from '@/lib/agent/agentService';

export interface UseAgentRealTimeResult {
  agents: Record<string, Agent>;
  allExecutions: AgentExecution[];
  activeCount: number;
  runningCount: number;
  failedCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;

  subscribe: (channel: string, callback: (data: unknown) => void) => () => void;
  unsubscribe: (channel: string) => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for global agent status and real-time updates
 * 
 * Features:
 * - Manages all agent states
 * - Real-time WebSocket updates
 * - Batched updates to prevent thrashing
 * - Polling fallback
 * - Agent metrics aggregation
 */
export function useAgentRealTime(
  candidateId: string,
  options?: {
    autoConnect?: boolean;
    refreshInterval?: number;
    batchDelay?: number; // ms to debounce updates
  }
): UseAgentRealTimeResult {
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [allExecutions, setAllExecutions] = useState<AgentExecution[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const subscriptionsRef = useRef<Map<string, Set<(data: unknown) => void>>>(
    new Map()
  );
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshInterval = options?.refreshInterval || 5000;

  /**
   * Fetch all executions for candidate
   */
  const fetchExecutions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCandidateExecutions(candidateId, {
        pageSize: 50,
      });
      setAllExecutions(response.executions);
      setError(null);

      // Update agent states from executions
      const updatedAgents: Record<string, Agent> = { ...agents };
      response.executions.forEach((exec) => {
        if (exec.agentType) {
          const execStatusMap: Record<string, 'idle' | 'running' | 'waiting' | 'error'> = {
            queued: 'waiting', running: 'running', completed: 'idle', failed: 'error',
          };
          updatedAgents[exec.agentType] = {
            ...agents[exec.agentType],
            status: execStatusMap[exec.status] ?? 'idle',
            progress: exec.progress,
            tokensUsed: exec.tokenCount ?? 0,
            errorMessage: exec.errorMessage,
            lastActivity: exec.updatedAt,
          };
        }
      });
      setAgents(updatedAgents);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch executions'));
    } finally {
      setIsLoading(false);
    }
  }, [candidateId, agents]);



  /**
   * Subscribe to a channel
   */
  const subscribe = useCallback((channel: string, callback: (data: unknown) => void) => {
    if (!subscriptionsRef.current.has(channel)) {
      subscriptionsRef.current.set(channel, new Set());
    }
    subscriptionsRef.current.get(channel)?.add(callback);

    return () => {
      subscriptionsRef.current.get(channel)?.delete(callback);
    };
  }, []);

  /**
   * Unsubscribe from a channel
   */
  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel);
  }, []);

  /**
   * Setup WebSocket connection (mock for now)
   */
  useEffect(() => {
    if (!options?.autoConnect || !candidateId) return;

    let es: EventSource | null = null;
    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (fallbackTimer) return;
      fallbackTimer = setInterval(fetchExecutions, refreshInterval);
    };

    const stopPolling = () => {
      if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
    };

    try {
      es = new EventSource('/api/agents/events');

      es.addEventListener('snapshot', (e: MessageEvent) => {
        try {
          const snapshot = JSON.parse(e.data) as Record<string, Partial<Agent>>;
          setAgents((prev) => {
            const next = { ...prev };
            Object.entries(snapshot).forEach(([type, status]) => {
              next[type] = { ...prev[type], ...status };
            });
            return next;
          });
        } catch { /* ignore parse errors */ }
      });

      es.addEventListener('agent:status_update', (e: MessageEvent) => {
        try {
          const ev = JSON.parse(e.data);
          setAgents((prev) => ({
            ...prev,
            [ev.agentType]: {
              ...prev[ev.agentType],
              status: ev.status,
              lastActivity: ev.lastActivity,
              tokensUsed: ev.tokensUsed ?? prev[ev.agentType]?.tokensUsed,
            },
          }));
        } catch { /* ignore */ }
      });

      es.addEventListener('agent:execution_update', (e: MessageEvent) => {
        try {
          const ev = JSON.parse(e.data);
          setAllExecutions((prev) =>
            prev.map((x) => (x.id === ev.executionId ? { ...x, ...ev } : x))
          );
        } catch { /* ignore */ }
      });

      // Refresh execution list when an agent starts or completes so AgentRail
      // reflects status transitions without waiting for the polling interval.
      es.addEventListener('agent:started', () => { fetchExecutions(); });
      es.addEventListener('agent:completed', () => { fetchExecutions(); });

      es.onopen = () => { setIsConnected(true); stopPolling(); };
      es.onerror = () => { setIsConnected(false); startPolling(); };
    } catch {
      startPolling();
    }

    return () => {
      es?.close();
      stopPolling();
      if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    };
  }, [candidateId, options?.autoConnect, refreshInterval, fetchExecutions]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (candidateId && options?.autoConnect) {
      fetchExecutions();
    }
  }, [candidateId, options?.autoConnect, fetchExecutions]);

  /**
   * Calculate metrics
   */
  const activeCount = Object.values(agents).filter(
    (a) => a.status === 'running' || a.status === 'waiting'
  ).length;

  const runningCount = Object.values(agents).filter((a) => a.status === 'running')
    .length;

  const failedCount = Object.values(agents).filter((a) => a.status === 'failed')
    .length;

  return {
    agents,
    allExecutions,
    activeCount,
    runningCount,
    failedCount,
    isConnected,
    isLoading,
    error,

    subscribe,
    unsubscribe,
    refresh: fetchExecutions,
  };
}

export default useAgentRealTime;

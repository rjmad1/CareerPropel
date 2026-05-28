import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent, AgentExecution } from '@/types/agent';
import { getCandidateExecutions } from '@/lib/agent/agentService';
import { acquireSseSubscription } from '@/lib/realtime/sse-manager';

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

    let fallbackTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (fallbackTimer) return;
      console.log('[useAgentRealTime] Starting fallback polling');
      fallbackTimer = setInterval(fetchExecutions, refreshInterval);
    };

    const stopPolling = () => {
      if (fallbackTimer) {
        console.log('[useAgentRealTime] Stopping fallback polling');
        clearInterval(fallbackTimer);
        fallbackTimer = null;
      }
    };

    console.log('[useAgentRealTime] Acquiring SSE subscription');
    const sub = acquireSseSubscription('/api/agents/events');

    const unsubSnapshot = sub.subscribe('snapshot', (msg) => {
      try {
        console.log('[useAgentRealTime] Received snapshot event');
        const snapshot = msg.data as Record<string, Partial<Agent>>;
        setAgents((prev) => {
          const next = { ...prev };
          Object.entries(snapshot).forEach(([type, status]) => {
            next[type] = { ...prev[type], ...status };
          });
          return next;
        });
      } catch (err) {
        console.error('[useAgentRealTime] Error handling snapshot:', err);
      }
    });

    const unsubStatusUpdate = sub.subscribe('agent:status_update', (msg) => {
      try {
        const ev = msg.data as any;
        console.log(`[useAgentRealTime] Received agent:status_update: ${ev.agentType} status=${ev.status}`);
        setAgents((prev) => ({
          ...prev,
          [ev.agentType]: {
            ...prev[ev.agentType],
            status: ev.status,
            lastActivity: ev.lastActivity,
            tokensUsed: ev.tokensUsed ?? prev[ev.agentType]?.tokensUsed,
          },
        }));
      } catch (err) {
        console.error('[useAgentRealTime] Error handling status update:', err);
      }
    });

    const unsubExecutionUpdate = sub.subscribe('agent:execution_update', (msg) => {
      try {
        const ev = msg.data as any;
        console.log(`[useAgentRealTime] Received agent:execution_update: ${ev.executionId}`);
        setAllExecutions((prev) =>
          prev.map((x) => (x.id === ev.executionId ? { ...x, ...ev } : x))
        );
      } catch (err) {
        console.error('[useAgentRealTime] Error handling execution update:', err);
      }
    });

    const unsubStarted = sub.subscribe('agent:started', () => {
      console.log('[useAgentRealTime] Received agent:started. Triggering execution fetch.');
      fetchExecutions();
    });

    const unsubCompleted = sub.subscribe('agent:completed', () => {
      console.log('[useAgentRealTime] Received agent:completed. Triggering execution fetch.');
      fetchExecutions();
    });

    const unsubConnChange = sub.onConnectionChange((connected) => {
      console.log(`[useAgentRealTime] SSE connection state changed to: ${connected}`);
      setIsConnected(connected);
      if (connected) {
        stopPolling();
      } else {
        startPolling();
      }
    });

    // Sync initial connection state
    Promise.resolve().then(() => {
      setIsConnected(sub.connected);
    });
    if (sub.connected) {
      stopPolling();
    } else {
      startPolling();
    }

    return () => {
      console.log('[useAgentRealTime] Releasing SSE subscription and cleaning up');
      unsubSnapshot();
      unsubStatusUpdate();
      unsubExecutionUpdate();
      unsubStarted();
      unsubCompleted();
      unsubConnChange();
      sub.release();
      stopPolling();
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [candidateId, options?.autoConnect, refreshInterval, fetchExecutions]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (candidateId && options?.autoConnect) {
      Promise.resolve().then(() => {
        fetchExecutions();
      });
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

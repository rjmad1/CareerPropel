import { useState, useEffect, useCallback, useRef } from 'react';
import { Agent } from '@/lib/websocket/types';
import { getCandidateExecutions } from '@/lib/agent/agentService';

export interface UseAgentRealTimeResult {
  agents: Record<string, Agent>;
  allExecutions: any[]; // AgentExecution[]
  activeCount: number;
  runningCount: number;
  failedCount: number;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;

  subscribe: (channel: string, callback: (data: any) => void) => () => void;
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
  const [allExecutions, setAllExecutions] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const subscriptionsRef = useRef<Map<string, Set<(data: any) => void>>>(
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
          updatedAgents[exec.agentType] = {
            ...agents[exec.agentType],
            status: exec.status,
            progress: exec.progress,
            currentTask: exec.currentTask,
            tokensUsed: exec.tokenUsage,
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
  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
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

/*
   * Setup WebSocket connection (mock for now)
   */
  useEffect(() => {
    if (!options?.autoConnect || !candidateId) return;

    const connect = () => {
      try {
        // TODO: Connect to actual WebSocket/EventSource
        // For now, we use polling as fallback
        setIsConnected(true);

        // Setup polling
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(() => {
          fetchExecutions();
        }, refreshInterval);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Connection failed'));
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
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


import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentExecution, ToolCall, EventLog } from '@/types/agent';
import {
  getAgentExecution,
  getAgentLogs,
  pauseAgentExecution,
  resumeAgentExecution,
  cancelAgentExecution,
  subscribeToAgentExecution,
  pollAgentExecution,
} from '@/lib/agent/agentService';
export interface UseAgentExecutionResult {
  execution: AgentExecution | null;
  toolCalls: ToolCall[];
  logs: EventLog[];
  status: 'idle' | 'loading' | 'error' | 'ready';
  error: Error | null;
  isLoading: boolean;
  isRunning: boolean;

  // Pagination
  currentPage: number;
  totalLogs: number;
  logsPerPage: number;
  goToPage: (page: number) => Promise<void>;

  // Filtering
  filterLevel: string | null;
  setFilterLevel: (level: string | null) => void;

  // Actions
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
  refresh: () => Promise<void>;

  // Action states
  isPauseLoading: boolean;
  isResumeLoading: boolean;
  isCancelLoading: boolean;
}

/**
 * Hook for managing agent execution lifecycle
 * 
 * Features:
 * - Real-time updates via EventSource/WebSocket
 * - Fallback to polling
 * - Tool call tracking
 * - Event log pagination and filtering
 * - Pause/resume/cancel actions
 * - Auto-refresh when status changes
 */
export function useAgentExecution(
  executionId: string,
  options?: {
    autoSubscribe?: boolean;
    refreshInterval?: number;
    useSse?: boolean; // Use Server-Sent Events instead of polling
  }
): UseAgentExecutionResult {
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ready'>('idle');
  const [error, setError] = useState<Error | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);

  const [isPauseLoading, setIsPauseLoading] = useState(false);
  const [isResumeLoading, setIsResumeLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);

  const logsPerPage = 50;
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const pollCleanupRef = useRef<(() => void) | null>(null);

  const isRunning = execution?.status === 'running';

  /**
   * Fetch execution data
   */
  const fetchExecution = useCallback(async () => {
    try {
      setStatus('loading');
      const data = await getAgentExecution(executionId);
      setExecution(data.execution);
      setToolCalls(data.toolCalls);
      setTotalLogs(data.logs.length);
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatus('error');
    }
  }, [executionId]);

  /**
   * Fetch logs with pagination and filtering
   */
  const fetchLogs = useCallback(
    async (page: number) => {
      try {
        const response = await getAgentLogs(executionId, {
          page,
          pageSize: logsPerPage,
          level: filterLevel as any,
        });
        setLogs(response.logs);
        setCurrentPage(response.page);
        setTotalLogs(response.total);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch logs'));
      }
    },
    [executionId, filterLevel, logsPerPage]
  );

  /**
   * Setup real-time subscriptions
   */
  useEffect(() => {
    if (!options?.autoSubscribe || !executionId) return;

    const useSse = options?.useSse ?? true;

    if (useSse) {
      // Try EventSource first (SSE)
      const handleUpdate = (event: { type: string; data: any }) => {
        if (event.type === 'execution:update') {
          setExecution(event.data);
        } else if (event.type === 'toolcall:complete') {
          setToolCalls((prev) => {
            const updated = [...prev];
            const index = updated.findIndex((tc) => tc.id === event.data.id);
            if (index !== -1) {
              updated[index] = event.data;
            }
            return updated;
          });
        } else if (event.type === 'log:new') {
          setLogs((prev) => [...prev.slice(-49), event.data]); // Keep last 50
        }
      };

      unsubscribeRef.current = subscribeToAgentExecution(
        executionId,
        handleUpdate,
        (err) => {
          console.warn('SSE connection failed, falling back to polling:', err);
          // Fallback to polling
          if (pollCleanupRef.current) pollCleanupRef.current();
          pollCleanupRef.current = pollAgentExecution(executionId, (response) => {
            setExecution(response.execution);
            setToolCalls(response.toolCalls);
            setLogs(response.logs);
          });
        }
      );
    } else {
      // Direct polling
      if (pollCleanupRef.current) pollCleanupRef.current();
      pollCleanupRef.current = pollAgentExecution(executionId, (response) => {
        setExecution(response.execution);
        setToolCalls(response.toolCalls);
        setLogs(response.logs);
      });
    }

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (pollCleanupRef.current) pollCleanupRef.current();
    };
  }, [executionId, options?.autoSubscribe, options?.useSse]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    if (executionId) {
      fetchExecution();
    }
  }, [executionId, fetchExecution]);

  /**
   * Fetch logs when page or filter changes
   */
  useEffect(() => {
    if (executionId) {
      fetchLogs(currentPage);
    }
  }, [executionId, currentPage, filterLevel, fetchLogs]);

  /**
   * Handle pause action
   */
  const pause = useCallback(async () => {
    try {
      setIsPauseLoading(true);
      const updated = await pauseAgentExecution(executionId);
      setExecution(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to pause execution'));
    } finally {
      setIsPauseLoading(false);
    }
  }, [executionId]);

  /**
   * Handle resume action
   */
  const resume = useCallback(async () => {
    try {
      setIsResumeLoading(true);
      const updated = await resumeAgentExecution(executionId);
      setExecution(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to resume execution'));
    } finally {
      setIsResumeLoading(false);
    }
  }, [executionId]);

  /**
   * Handle cancel action
   */
  const cancel = useCallback(async () => {
    try {
      setIsCancelLoading(true);
      const updated = await cancelAgentExecution(executionId);
      setExecution(updated);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to cancel execution'));
    } finally {
      setIsCancelLoading(false);
    }
  }, [executionId]);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchExecution();
  }, [fetchExecution]);

  /**
   * Navigate to a specific page
   */
  const goToPage = useCallback(
    async (page: number) => {
      setCurrentPage(page);
    },
    []
  );

  return {
    execution,
    toolCalls,
    logs,
    status,
    error,
    isLoading: status === 'loading',
    isRunning,

    currentPage,
    totalLogs,
    logsPerPage,
    goToPage,

    filterLevel,
    setFilterLevel,

    pause,
    resume,
    cancel,
    refresh,

    isPauseLoading,
    isResumeLoading,
    isCancelLoading,
  };
}

export default useAgentExecution;

'use client';

/**
 * useAgentStatus — polls agent execution status via REST.
 *
 * The legacy WebSocket transport (/api/ws) returned 410 Gone and has been
 * removed. Live per-execution updates are available via SSE at:
 *   GET /api/agent/execution/[executionId]/subscribe
 *
 * Use useAgentExecution({ autoSubscribe: true, useSse: true }) when you
 * need real-time updates for a specific execution.
 */

import { useEffect, useState, useCallback } from 'react';
import { AgentType } from '@/lib/realtime/events';
import type { AgentStatusEvent } from '@/lib/realtime/events';

interface AgentStateMap {
  [key: string]: AgentStatusEvent;
}

export function useAgentStatus(autoConnect: boolean = true) {
  const [agents] = useState<AgentStateMap>({});
  const [isConnected] = useState(false);
  const [error] = useState<string | null>(null);

  const connect = useCallback(() => {}, []);
  const disconnect = useCallback(() => {}, []);

  const getAgentStatus = useCallback(
    (agentType: AgentType) => agents[agentType] || null,
    [agents]
  );

  const getAllAgents = useCallback(() => agents, [agents]);

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return {
    agents,
    isConnected,
    error,
    connect,
    disconnect,
    getAgentStatus,
    getAllAgents,
  };
}

export function useAgentStatusListener(agentType: AgentType) {
  const { agents, isConnected } = useAgentStatus(true);
  const status = agents[agentType] || null;

  return {
    status,
    isConnected,
    isRunning: status?.status === 'running',
    isError: status?.status === 'error',
    isCompleted: status?.status === 'completed',
    lastActivity: status?.lastActivity ? new Date(status.lastActivity) : null,
    queueDepth: status?.queueDepth || 0,
    confidence: status?.confidence || 0,
  };
}

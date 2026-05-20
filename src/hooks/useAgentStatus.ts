/**
 * React Hook: useAgentStatus
 * Manages WebSocket connection and subscribes to real-time agent status updates
 * 
 * Usage:
 * const { agents, isConnected, error } = useAgentStatus();
 * 
 * agents: Record<AgentType, AgentStatusEvent>
 * isConnected: boolean
 * error: string | null
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { AgentType, RealtimeEvent, AgentStatusEvent } from '@/lib/realtime/events';

interface AgentStateMap {
  [key: string]: AgentStatusEvent;
}

export function useAgentStatus(autoConnect: boolean = true) {
  const [agents, setAgents] = useState<AgentStateMap>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 3000; // 3 seconds

  /**
   * Handle incoming WebSocket messages
   */
  const handleMessage = useCallback((event: RealtimeEvent) => {
    switch (event.type) {
      case 'agent:status_update': {
        const statusEvent = event;
        setAgents((prev) => ({
          ...prev,
          [statusEvent.agentType]: statusEvent,
        }));
        break;
      }

      // @ts-expect-error: 'initial_state' is a custom server event not in the union
      case 'initial_state': {
        const initialAgents = (event as unknown as { agents: AgentStateMap }).agents || {};
        setAgents(initialAgents);
        break;
      }

      case 'agent:started': {
        const { agentType } = event;
        setAgents((prev) => ({
          ...prev,
          [agentType]: {
            ...prev[agentType],
            status: 'running',
            lastActivity: new Date(),
          } as AgentStatusEvent,
        }));
        break;
      }

      case 'agent:completed': {
        const { agentType, status } = event;
        setAgents((prev) => ({
          ...prev,
          [agentType]: {
            ...prev[agentType],
            status: status === 'success' ? 'completed' : 'error',
            lastActivity: new Date(),
          } as AgentStatusEvent,
        }));
        break;
      }

      case 'heartbeat': {
        // Heartbeat - connection is alive
        break;
      }

      case 'error': {
        console.error('[Agent Status] Server error:', event.message);
        setError(event.message);
        break;
      }

      default:
        console.log('[Agent Status] Unknown event type:', event.type);
    }
  }, []);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      console.log('[Agent Status] Already connected');
      return;
    }

    try {
      // Build WebSocket URL
      const protocol = globalThis.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = globalThis.location.host;
      const url = `${protocol}//${host}/api/ws`;

      console.log('[Agent Status] Connecting to', url);
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('[Agent Status] Connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as RealtimeEvent;
          handleMessage(message);
        } catch (err) {
          console.error('[Agent Status] Failed to parse message:', err);
        }
      };

      socket.onerror = (event) => {
        console.error('[Agent Status] WebSocket error:', event);
        setError('Connection error');
        setIsConnected(false);
      };

      socket.onclose = () => {
        console.log('[Agent Status] Disconnected');
        setIsConnected(false);
        socketRef.current = null;

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts && autoConnect) {
          reconnectAttemptsRef.current++;
          const delay = reconnectDelayMs * Math.pow(2, reconnectAttemptsRef.current - 1);
          console.log(`[Agent Status] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      socketRef.current = socket;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Agent Status] Connection failed:', message);
      setError(message);
      setIsConnected(false);
    }
  }, [autoConnect, handleMessage]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  /**
   * Get specific agent status
   */
  const getAgentStatus = useCallback(
    (agentType: AgentType) => agents[agentType] || null,
    [agents]
  );

  /**
   * Get all agents
   */
  const getAllAgents = useCallback(() => agents, [agents]);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
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

/**
 * Hook for listening to a specific agent's status
 */
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

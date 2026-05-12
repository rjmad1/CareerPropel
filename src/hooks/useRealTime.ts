'use client';

/**
 * useRealTime Hook
 * React hook for managing WebSocket connections and real-time updates
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { getWebSocketClient, initWebSocket } from '@/lib/websocket/client';
import { AnyWebSocketMessage, Agent, Notification, RealtimeJobUpdate } from '@/lib/websocket/types';

interface UseRealTimeOptions {
  autoConnect?: boolean;
  url?: string;
  channels?: string[];
}

interface UseRealTimeReturn {
  connected: boolean;
  subscribe: (type: string, handler: (msg: AnyWebSocketMessage) => void) => () => void;
  send: (message: AnyWebSocketMessage) => void;
  subscribeToChannels: (channels: string[]) => void;
  unsubscribeFromChannels: (channels: string[]) => void;
}

/**
 * Hook for real-time WebSocket functionality
 */
export function useRealTime(options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const { autoConnect = true, url = process.env.NEXT_PUBLIC_WEBSOCKET_URL, channels = [] } = options;
  
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<ReturnType<typeof getWebSocketClient> | null>(null);
  const unsubscribeConnectionRef = useRef<(() => void) | null>(null);

  // Initialize and connect
  useEffect(() => {
    if (!autoConnect || !url) return;

    try {
      if (!clientRef.current) {
        clientRef.current = initWebSocket(url);
      }

      const client = clientRef.current;

      // Subscribe to connection changes
      unsubscribeConnectionRef.current = client.onConnectionChange((isConnected) => {
        setConnected(isConnected);
      });

      // Connect
      client.connect().then(() => {
        console.log('WebSocket connected via useRealTime');
        if (channels.length > 0) {
          client.subscribeToChannels(channels);
        }
      }).catch((error) => {
        console.error('WebSocket connection failed', error);
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket', error);
    }

    return () => {
      if (unsubscribeConnectionRef.current) {
        unsubscribeConnectionRef.current();
      }
    };
  }, [autoConnect, url, channels]);

  const subscribe = useCallback(
    (type: string, handler: (msg: AnyWebSocketMessage) => void) => {
      if (!clientRef.current) {
        console.warn('WebSocket client not initialized');
        return () => {};
      }
      return clientRef.current.subscribe(type, handler);
    },
    []
  );

  const send = useCallback((message: AnyWebSocketMessage) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized');
      return;
    }
    clientRef.current.send(message);
  }, []);

  const subscribeToChannels = useCallback((channelList: string[]) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized');
      return;
    }
    clientRef.current.subscribeToChannels(channelList);
  }, []);

  const unsubscribeFromChannels = useCallback((channelList: string[]) => {
    if (!clientRef.current) {
      console.warn('WebSocket client not initialized');
      return;
    }
    clientRef.current.unsubscribeFromChannels(channelList);
  }, []);

  return {
    connected,
    subscribe,
    send,
    subscribeToChannels,
    unsubscribeFromChannels,
  };
}

/**
 * Hook for agent status updates
 */
export function useAgentStatus(agentId?: string) {
  const { subscribe, connected } = useRealTime();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe('agent:status', (message: AnyWebSocketMessage) => {
      if (message.type === 'agent:status') {
        const agentMsg = message as any;
        if (!agentId || agentMsg.data.id === agentId) {
          setAgent(agentMsg.data);
        }
      }
    });

    return unsubscribe;
  }, [agentId, connected, subscribe]);

  return { agent, connected };
}

/**
 * Hook for job updates
 */
export function useJobUpdates(jobId?: string) {
  const { subscribe, connected } = useRealTime();
  const [update, setUpdate] = useState<RealtimeJobUpdate | null>(null);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe('job:update', (message: AnyWebSocketMessage) => {
      if (message.type === 'job:update') {
        const jobMsg = message as any;
        if (!jobId || jobMsg.data.jobId === jobId) {
          setUpdate(jobMsg.data);
        }
      }
    });

    return unsubscribe;
  }, [jobId, connected, subscribe]);

  return { update, connected };
}

/**
 * Hook for notifications
 */
export function useNotifications() {
  const { subscribe, connected } = useRealTime();
  const [notification, setNotification] = useState<Notification | null>(null);
  const notificationsRef = useRef<Notification[]>([]);

  useEffect(() => {
    if (!connected) return;

    const unsubscribe = subscribe('notification', (message: AnyWebSocketMessage) => {
      if (message.type === 'notification') {
        const notifMsg = message as any;
        notificationsRef.current.push(notifMsg.data);
        setNotification(notifMsg.data);

        // Auto-clear after duration
        if (notifMsg.data.duration) {
          setTimeout(() => {
            notificationsRef.current = notificationsRef.current.filter(
              (n) => n.id !== notifMsg.data.id
            );
          }, notifMsg.data.duration);
        }
      }
    });

    return unsubscribe;
  }, [connected, subscribe]);

  return {
    notification,
    notifications: notificationsRef.current,
    connected,
  };
}

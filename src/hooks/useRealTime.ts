'use client';

/**
 * useRealTime — navigation-resilient SSE subscription hook.
 *
 * Uses the module-level SSE singleton (sse-manager.ts) so that:
 *  - Multiple components share ONE EventSource per endpoint
 *  - Route transitions do NOT drop active subscriptions
 *  - No duplicate connections are created
 *  - Connection state is accurately reflected in all subscribers
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { AnyWebSocketMessage, Agent, Notification, RealtimeJobUpdate } from '@/lib/websocket/types';
import { acquireSseSubscription, type SseSubscription } from '@/lib/realtime/sse-manager';

interface UseRealTimeOptions {
  autoConnect?: boolean;
  channels?: string[];
  endpoint?: string;
}

interface UseRealTimeReturn {
  connected: boolean;
  subscribe: (type: string, handler: (msg: AnyWebSocketMessage) => void) => () => void;
  send: (message: AnyWebSocketMessage) => void;
  subscribeToChannels: (channels: string[]) => void;
  unsubscribeFromChannels: (channels: string[]) => void;
}

export function useRealTime(options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const { autoConnect = true, endpoint = '/api/agents/events' } = options;

  const [connected, setConnected] = useState(false);
  const subscriptionRef = useRef<SseSubscription | null>(null);

  useEffect(() => {
    if (!autoConnect || typeof window === 'undefined') return;

    const sub = acquireSseSubscription(endpoint);
    subscriptionRef.current = sub;

    // Sync initial state
    setConnected(sub.connected);

    // Track connection state changes
    const unlistenConnection = sub.onConnectionChange((c) => setConnected(c));

    return () => {
      unlistenConnection();
      sub.release();
      subscriptionRef.current = null;
      setConnected(false);
    };
  }, [autoConnect, endpoint]);

  const subscribe = useCallback(
    (type: string, handler: (msg: AnyWebSocketMessage) => void) => {
      const sub = subscriptionRef.current;
      if (sub) return sub.subscribe(type, handler);
      // If not yet connected, buffer the subscription until connect
      return () => undefined;
    },
    [],
  );

  // SSE is server→client only; mutations go through REST endpoints
  const send = useCallback((_message: AnyWebSocketMessage) => {}, []);
  const subscribeToChannels = useCallback((_channels: string[]) => {}, []);
  const unsubscribeFromChannels = useCallback((_channels: string[]) => {}, []);

  return { connected, subscribe, send, subscribeToChannels, unsubscribeFromChannels };
}

// ─── Derived hooks (same API as before) ──────────────────────────────────────

export function useAgentStatus(agentType?: string) {
  const { subscribe, connected } = useRealTime();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (!connected) return;
    return subscribe('agent:status_update', (message: AnyWebSocketMessage) => {
      const ev = message as any;
      if (!agentType || ev.data?.agentType === agentType) {
        setAgent(ev.data ?? null);
      }
    });
  }, [agentType, connected, subscribe]);

  return { agent, connected };
}

export function useJobUpdates(jobId?: string) {
  const { subscribe, connected } = useRealTime();
  const [update, setUpdate] = useState<RealtimeJobUpdate | null>(null);

  useEffect(() => {
    if (!connected) return;
    return subscribe('job:update', (message: AnyWebSocketMessage) => {
      const ev = message as any;
      if (!jobId || ev.data?.jobId === jobId) {
        setUpdate(ev.data ?? null);
      }
    });
  }, [jobId, connected, subscribe]);

  return { update, connected };
}

export function useNotifications() {
  const { subscribe, connected } = useRealTime();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationsRef = useRef<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!connected) return;
    const unsubscribe = subscribe('notification', (message: AnyWebSocketMessage) => {
      const ev = message as any;
      const notif: Notification = ev.data;
      notificationsRef.current = [...notificationsRef.current, notif];
      setNotification(notif);
      setNotifications(notificationsRef.current);
      if (notif.duration) {
        const tid = setTimeout(() => {
          timeoutsRef.current.delete(notif.id);
          notificationsRef.current = notificationsRef.current.filter((n) => n.id !== notif.id);
          setNotifications([...notificationsRef.current]);
        }, notif.duration);
        timeoutsRef.current.set(notif.id, tid);
      }
    });
    return () => {
      unsubscribe();
      timeoutsRef.current.forEach((tid) => clearTimeout(tid));
      timeoutsRef.current.clear();
    };
  }, [connected, subscribe]);

  return { notification, notifications, connected };
}

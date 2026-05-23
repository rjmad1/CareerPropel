'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { AnyWebSocketMessage, Agent, Notification, RealtimeJobUpdate } from '@/lib/websocket/types';

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

// SSE event types the server emits
const SSE_EVENT_TYPES = [
  'snapshot',
  'agent:status_update',
  'agent:execution_update',
  'job:update',
  'job:created',
  'job:deleted',
  'notification',
];

export function useRealTime(options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const { autoConnect = true, endpoint = '/api/agents/events' } = options;

  const [connected, setConnected] = useState(false);
  const handlersRef = useRef<Map<string, Set<(msg: AnyWebSocketMessage) => void>>>(new Map());
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!autoConnect || typeof window === 'undefined') return;

    let es: EventSource;

    try {
      es = new EventSource(endpoint);
      esRef.current = es;

      es.onopen = () => setConnected(true);
      es.onerror = () => setConnected(false);

      // Route named SSE events to registered handlers
      SSE_EVENT_TYPES.forEach((eventType) => {
        es.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            // Wrap in a shape compatible with AnyWebSocketMessage
            const msg = { type: eventType, data } as unknown as AnyWebSocketMessage;
            handlersRef.current.get(eventType)?.forEach((h) => h(msg));
          } catch { /* ignore parse errors */ }
        });
      });
    } catch {
      // SSE not supported in this environment
    }

    return () => {
      esRef.current?.close();
      esRef.current = null;
      setConnected(false);
    };
  }, [autoConnect, endpoint]);

  const subscribe = useCallback((type: string, handler: (msg: AnyWebSocketMessage) => void) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    handlersRef.current.get(type)!.add(handler);
    return () => { handlersRef.current.get(type)?.delete(handler); };
  }, []);

  // SSE is server-to-client only; mutations go through REST endpoints
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

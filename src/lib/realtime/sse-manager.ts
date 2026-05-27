/**
 * Client-side SSE singleton manager.
 *
 * Problem solved: the previous architecture created one EventSource per component.
 * Under navigation-heavy usage (route transitions, split panels) this caused:
 *  - Multiple redundant SSE connections to the same endpoint
 *  - Subscriptions silently dropped when panels unmounted
 *  - No deduplication of event handlers
 *
 * This module maintains ONE EventSource per endpoint and fans out events to
 * all registered handlers via a listener map.
 *
 * Components register/unregister handlers without affecting the connection.
 * The connection stays alive until ALL handlers are removed (ref-counted teardown).
 */

import { AnyWebSocketMessage } from '@/types/agent';
import { emitNavigationEvent } from '@/lib/navigation/analytics';

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

type MessageHandler = (msg: AnyWebSocketMessage) => void;

interface SseConnection {
  es: EventSource;
  handlers: Map<string, Set<MessageHandler>>;
  /** Number of active subscribers (for ref-counting) */
  refCount: number;
  connected: boolean;
  connectionListeners: Set<(connected: boolean) => void>;
}

/** Module-level registry: endpoint → connection */
const connections = new Map<string, SseConnection>();

function getOrCreateConnection(endpoint: string): SseConnection {
  if (connections.has(endpoint)) {
    const conn = connections.get(endpoint)!;
    conn.refCount++;
    return conn;
  }

  const handlers = new Map<string, Set<MessageHandler>>();
  const connectionListeners = new Set<(connected: boolean) => void>();

  const es = new EventSource(endpoint);
  const conn: SseConnection = {
    es,
    handlers,
    refCount: 1,
    connected: false,
    connectionListeners,
  };

  es.onopen = () => {
    conn.connected = true;
    connectionListeners.forEach((l) => l(true));
    emitNavigationEvent('sse_subscription_preserved', {
      meta: { endpoint, event: 'open' },
    });
  };

  es.onerror = () => {
    conn.connected = false;
    connectionListeners.forEach((l) => l(false));
  };

  // Route each SSE event type to registered handlers
  SSE_EVENT_TYPES.forEach((type) => {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        const msg = { type, data } as unknown as AnyWebSocketMessage;
        handlers.get(type)?.forEach((h) => {
          try { h(msg); } catch { /* handler error must not break SSE loop */ }
        });
      } catch { /* ignore parse errors */ }
    });
  });

  connections.set(endpoint, conn);
  return conn;
}

function releaseConnection(endpoint: string): void {
  const conn = connections.get(endpoint);
  if (!conn) return;
  conn.refCount--;
  if (conn.refCount <= 0) {
    conn.es.close();
    connections.delete(endpoint);
    emitNavigationEvent('sse_subscription_lost', { meta: { endpoint } });
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SseSubscription {
  /** Current connection state */
  connected: boolean;
  /** Subscribe to a specific event type. Returns unsubscribe fn. */
  subscribe: (type: string, handler: MessageHandler) => () => void;
  /** Subscribe to connection state changes. Returns unsubscribe fn. */
  onConnectionChange: (listener: (connected: boolean) => void) => () => void;
  /** Release this subscription's hold on the connection. */
  release: () => void;
}

/**
 * Acquire a subscription to the SSE endpoint.
 * Multiple calls with the same endpoint share one EventSource.
 * Call release() when no longer needed (component unmount).
 */
export function acquireSseSubscription(endpoint: string): SseSubscription {
  if (typeof window === 'undefined') {
    // SSR guard — return no-op subscription
    return {
      connected: false,
      subscribe: () => () => undefined,
      onConnectionChange: () => () => undefined,
      release: () => undefined,
    };
  }

  let released = false;
  const conn = getOrCreateConnection(endpoint);

  return {
    get connected() { return conn.connected; },

    subscribe(type: string, handler: MessageHandler) {
      if (!conn.handlers.has(type)) conn.handlers.set(type, new Set());
      conn.handlers.get(type)!.add(handler);
      return () => conn.handlers.get(type)?.delete(handler);
    },

    onConnectionChange(listener: (connected: boolean) => void) {
      conn.connectionListeners.add(listener);
      return () => conn.connectionListeners.delete(listener);
    },

    release() {
      if (!released) {
        released = true;
        releaseConnection(endpoint);
      }
    },
  };
}

/** Return current connection count (for observability/debugging). */
export function getSseConnectionCount(): number {
  return connections.size;
}

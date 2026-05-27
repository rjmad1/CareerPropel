'use client';

/**
 * useRealTime — stub hook for agent-level real-time state.
 *
 * The legacy WebSocket transport has been removed. Agent execution
 * updates are now streamed per-execution via SSE at:
 *   GET /api/agent/execution/[executionId]/subscribe
 *
 * Components that need live execution state should use useAgentExecution
 * with { autoSubscribe: true, useSse: true }.
 *
 * This stub preserves the existing call-sites (AgentRail) without
 * attempting WebSocket connections that would fail with 410.
 */

interface UseRealTimeOptions {
  autoConnect?: boolean;
  channels?: string[];
  endpoint?: string;
}

interface UseRealTimeReturn {
  connected: boolean;
  subscribe: (type: string, handler: (msg: unknown) => void) => () => void;
  send: (message: unknown) => void;
  subscribeToChannels: (channels: string[]) => void;
  unsubscribeFromChannels: (channels: string[]) => void;
}

export function useRealTime(_options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const noop = () => () => {};

  return {
    connected: false,
    subscribe: noop,
    send: () => {},
    subscribeToChannels: () => {},
    unsubscribeFromChannels: () => {},
  };
}

export function useAgentStatus(_agentId?: string) {
  return { agent: null, connected: false };
}

export function useJobUpdates(_jobId?: string) {
  return { update: null, connected: false };
}

export function useNotifications() {
  return { notification: null, notifications: [], connected: false };
}

/**
 * Navigation analytics & observability.
 *
 * Instruments navigation events for operational telemetry:
 *  - backtracking loops
 *  - rage clicks
 *  - dead-end abandonment
 *  - navigation latency
 *  - failed route transitions
 *  - repeated oscillation patterns
 *
 * Events are emitted to structured logger and can be forwarded to
 * any analytics sink (PostHog, Segment, etc.) by wiring up the
 * `onNavigationEvent` hook.
 */

import { log } from '@/lib/logging/logger';

export type NavigationEventType =
  | 'route_enter'
  | 'route_exit'
  | 'back_navigate'
  | 'deep_link_restore'
  | 'restoration_success'
  | 'restoration_failed'
  | 'sse_subscription_preserved'
  | 'sse_subscription_lost'
  | 'unsaved_changes_warned'
  | 'unsaved_changes_discarded'
  | 'navigation_latency'
  | 'oscillation_detected'
  | 'dead_end_exit';

export interface NavigationEvent {
  type: NavigationEventType;
  /** Route being navigated FROM */
  from?: string;
  /** Route being navigated TO */
  to?: string;
  /** Duration in ms (for latency events) */
  durationMs?: number;
  /** Contextual extras */
  meta?: Record<string, unknown>;
  timestamp: number;
}

type NavigationEventHandler = (event: NavigationEvent) => void;

const handlers: NavigationEventHandler[] = [];

/** Register a handler that receives every navigation event. */
export function onNavigationEvent(handler: NavigationEventHandler): () => void {
  handlers.push(handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx >= 0) handlers.splice(idx, 1);
  };
}

/** Emit a navigation event to all registered handlers + structured log. */
export function emitNavigationEvent(
  type: NavigationEventType,
  data: Omit<NavigationEvent, 'type' | 'timestamp'> = {},
): void {
  const event: NavigationEvent = { type, timestamp: Date.now(), ...data };

  // Structured log (server & client safe — logger guards env)
  try {
    log.debug({ navigation: event }, `nav:${type}`);
  } catch {
    // logger unavailable in some client contexts
  }

  handlers.forEach((h) => {
    try { h(event); } catch { /* handler errors must not break navigation */ }
  });
}

// ─── Oscillation detection ────────────────────────────────────────────────────

const MAX_HISTORY = 10;
const OSCILLATION_WINDOW_MS = 60_000;
const OSCILLATION_THRESHOLD = 3;

interface HistoryEntry { route: string; at: number }
let recentHistory: HistoryEntry[] = [];

/** Call on every route enter. Returns true if oscillation is detected. */
export function trackRouteEnter(route: string): boolean {
  const now = Date.now();
  recentHistory = recentHistory.filter((e) => now - e.at < OSCILLATION_WINDOW_MS);
  recentHistory.push({ route, at: now });
  if (recentHistory.length > MAX_HISTORY) recentHistory.shift();

  // Count how many times we've visited this route in the window
  const count = recentHistory.filter((e) => e.route === route).length;
  if (count >= OSCILLATION_THRESHOLD) {
    emitNavigationEvent('oscillation_detected', {
      to: route,
      meta: { visitCount: count, windowMs: OSCILLATION_WINDOW_MS },
    });
    return true;
  }
  return false;
}

/** Reset history (e.g. after sign-out). */
export function resetNavigationHistory(): void {
  recentHistory = [];
}

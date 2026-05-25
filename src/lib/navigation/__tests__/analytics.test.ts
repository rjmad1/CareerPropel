/**
 * Unit tests for src/lib/navigation/analytics.ts
 */

import {
  emitNavigationEvent,
  onNavigationEvent,
  trackRouteEnter,
  resetNavigationHistory,
  type NavigationEvent,
} from '../analytics';

describe('onNavigationEvent / emitNavigationEvent', () => {
  it('calls registered handler on emit', () => {
    const events: NavigationEvent[] = [];
    const unsubscribe = onNavigationEvent((e) => events.push(e));

    emitNavigationEvent('route_enter', { to: '/dashboard' });
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('route_enter');
    expect(events[0].to).toBe('/dashboard');
    expect(events[0].timestamp).toBeGreaterThan(0);

    unsubscribe();
  });

  it('unsubscribes correctly', () => {
    const events: NavigationEvent[] = [];
    const unsubscribe = onNavigationEvent((e) => events.push(e));
    unsubscribe();

    emitNavigationEvent('route_exit');
    expect(events).toHaveLength(0);
  });

  it('supports multiple handlers', () => {
    const a: NavigationEvent[] = [];
    const b: NavigationEvent[] = [];
    const u1 = onNavigationEvent((e) => a.push(e));
    const u2 = onNavigationEvent((e) => b.push(e));

    emitNavigationEvent('back_navigate');
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);

    u1();
    u2();
  });

  it('handler errors do not break other handlers', () => {
    const good: NavigationEvent[] = [];
    const u1 = onNavigationEvent(() => { throw new Error('boom'); });
    const u2 = onNavigationEvent((e) => good.push(e));

    expect(() => emitNavigationEvent('route_enter')).not.toThrow();
    expect(good).toHaveLength(1);

    u1();
    u2();
  });
});

describe('trackRouteEnter / oscillation detection', () => {
  beforeEach(() => {
    resetNavigationHistory();
  });

  it('returns false for first visit', () => {
    expect(trackRouteEnter('/dashboard')).toBe(false);
  });

  it('returns false for second visit', () => {
    trackRouteEnter('/dashboard');
    expect(trackRouteEnter('/dashboard')).toBe(false);
  });

  it('returns true on third visit (oscillation threshold)', () => {
    trackRouteEnter('/dashboard');
    trackRouteEnter('/dashboard');
    expect(trackRouteEnter('/dashboard')).toBe(true);
  });

  it('emits oscillation_detected event', () => {
    const events: NavigationEvent[] = [];
    const unsub = onNavigationEvent((e) => events.push(e));

    trackRouteEnter('/dashboard');
    trackRouteEnter('/dashboard');
    trackRouteEnter('/dashboard');

    const oscillation = events.find((e) => e.type === 'oscillation_detected');
    expect(oscillation).toBeDefined();
    expect(oscillation!.to).toBe('/dashboard');

    unsub();
  });

  it('does not detect oscillation for different routes', () => {
    trackRouteEnter('/dashboard');
    trackRouteEnter('/jobs');
    const result = trackRouteEnter('/analytics');
    expect(result).toBe(false);
  });
});

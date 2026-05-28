/**
 * @jest-environment node
 *
 * SSE Recovery & Reconnect Storm Protection Tests
 */

import { getBufferedEventsForUser } from '@/lib/realtime/sharedSubscriber';
import { checkReplayStorm, shouldThrottleEvent, sseProtectionConfig } from '@/lib/realtime/flood-protection';

describe('SSE Recovery & Flood Protection', () => {
  const userId = 'test-sse-user-001';

  beforeEach(() => {
    // Reset configs if modified
    sseProtectionConfig.replayStormThreshold = 5; // Lower for easier testing
    sseProtectionConfig.eventThrottlingLimit = 3;  // Lower for easier testing
  });

  afterEach(() => {
    // Reset to defaults
    sseProtectionConfig.replayStormThreshold = 10;
    sseProtectionConfig.eventThrottlingLimit = 30;
  });

  it('detects replay storm when connection recovery attempts exceed threshold', () => {
    // Simulate multiple reconnect checks within the threshold
    for (let i = 0; i < 5; i++) {
      const { isStorm } = checkReplayStorm(userId);
      expect(isStorm).toBe(false);
    }

    // Next one exceeds threshold (limit is 5)
    const { isStorm } = checkReplayStorm(userId);
    expect(isStorm).toBe(true);

    // Call recovery helper, verify it blocks recovery
    const recovered = getBufferedEventsForUser(userId, 'ev_123');
    expect(recovered).toEqual([]);
  });

  it('throttles events when emission frequency exceeds burst limit', () => {
    // Emit events within limit
    for (let i = 0; i < 3; i++) {
      const throttled = shouldThrottleEvent(userId);
      expect(throttled).toBe(false);
    }

    // 4th event in the same 1s window exceeds threshold (limit is 3)
    const throttled = shouldThrottleEvent(userId);
    expect(throttled).toBe(true);
  });
});

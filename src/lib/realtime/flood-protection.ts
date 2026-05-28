import { createLogger } from '@/lib/logging/logger';

const protectionLogger = createLogger({ component: 'sse-flood-protection' });

export interface SSEProtectionConfig {
  maxConnectionsPerUser: number;
  replayStormThreshold: number; // Max replays in window
  replayStormWindowMs: number;  // Window duration
  eventThrottlingLimit: number; // Max events per second
}

export const sseProtectionConfig: SSEProtectionConfig = {
  maxConnectionsPerUser: 5,
  replayStormThreshold: 10,
  replayStormWindowMs: 60000,   // 1 minute
  eventThrottlingLimit: 30,     // 30 events per second
};

// Track user-specific action timestamps
const userReplayTimestamps = new Map<string, number[]>();
const userEventRates = new Map<string, { count: number; windowStart: number }>();

/**
 * Checks if a user is initiating a replay storm.
 * Returns true if a storm is detected (exceeds threshold).
 */
export function checkReplayStorm(userId: string): { isStorm: boolean; rate: number } {
  const now = Date.now();
  const attempts = userReplayTimestamps.get(userId) || [];
  attempts.push(now);

  // Filter to window
  const windowStart = now - sseProtectionConfig.replayStormWindowMs;
  const recentAttempts = attempts.filter((ts) => ts >= windowStart);
  userReplayTimestamps.set(userId, recentAttempts);

  const rate = recentAttempts.length;
  const isStorm = rate > sseProtectionConfig.replayStormThreshold;

  if (isStorm) {
    protectionLogger.warn(
      { userId, rate, windowMs: sseProtectionConfig.replayStormWindowMs },
      'SSE Replay Storm Detected! High-frequency connection recovery blocked.'
    );
  }

  return { isStorm, rate };
}

/**
 * Enforces rate throttling on event emission.
 * Returns true if the event should be throttled (rate exceeded).
 */
export function shouldThrottleEvent(userId: string): boolean {
  const now = Date.now();
  const state = userEventRates.get(userId) || { count: 0, windowStart: now };

  if (now - state.windowStart >= 1000) {
    // Reset window
    userEventRates.set(userId, { count: 1, windowStart: now });
    return false;
  }

  state.count++;
  userEventRates.set(userId, state);

  if (state.count > sseProtectionConfig.eventThrottlingLimit) {
    protectionLogger.warn(
      { userId, count: state.count, limit: sseProtectionConfig.eventThrottlingLimit },
      'SSE Event Emitter Burst Throttling Triggered! Event dropped or delayed.'
    );
    return true;
  }

  return false;
}

/**
 * Returns memory utilization details of the SSE emitter for memory guards.
 */
export function getEmitterMemoryReport() {
  const memory = process.memoryUsage();
  return {
    rssMb: Math.round(memory.rss / 1024 / 1024),
    heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
    criticalLimitReached: memory.heapUsed > 1024 * 1024 * 1024 * 1.5, // 1.5 GB limit
  };
}

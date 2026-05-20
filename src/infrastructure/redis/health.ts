import 'server-only';
import Redis from 'ioredis';

export interface RedisHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latencyMs?: number;
  error?: string;
}

/**
 * Executes a fast ping check against the Redis instance to verify health
 */
export async function checkRedisHealth(client: Redis): Promise<RedisHealth> {
  const start = Date.now();
  try {
    // Ping with a strict 2-second timeout window
    const pingPromise = client.ping();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Redis health ping timeout')), 2000)
    );

    const res = await Promise.race([pingPromise, timeoutPromise]);
    
    if (res === 'PONG') {
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
      };
    }
    
    return {
      status: 'degraded',
      error: `Unexpected ping payload response: ${res}`,
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Registers one-time process listeners to ensure a clean quit when the app stops
 */
export function registerShutdownHook(client: Redis): void {
  const gracefulShutdown = async (signal: string) => {
    console.log(`[Redis Governance] Signal ${signal} observed. Cleaning up connection...`);
    try {
      // Disconnect cleanly via QUIT command
      await client.quit();
      console.log('[Redis Governance] Connection closed cleanly.');
    } catch (err) {
      console.error('[Redis Governance] Error during clean quit, forcing TCP socket disconnect:', err);
      client.disconnect();
    }
  };

  process.once('SIGINT', () => gracefulShutdown('SIGINT'));
  process.once('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

/**
 * Wraps an operational execution and returns a fallback value upon failures
 * to prevent hard crashes and enable graceful degradation (7. OPERATIONAL SAFETY)
 */
export async function executeSafely<T>(
  operation: () => Promise<T>,
  fallbackValue: T,
  operationName = 'Redis Command'
): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    console.error(`[Redis Fallback] ${operationName} failed. Degrading gracefully:`, err);
    return fallbackValue;
  }
}

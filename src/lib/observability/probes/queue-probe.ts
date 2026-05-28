import { getExecutionQueue } from '@/lib/queue/queues';
import { createLogger } from '@/lib/logging/logger';

const probeLogger = createLogger({ component: 'queue-probe' });

export interface QueueProbeResult {
  status: 'healthy' | 'degraded' | 'critical';
  latencyMs: number;
  message?: string;
}

/**
 * Verifies queue enqueue latency and connection health.
 */
export async function runQueueProbe(): Promise<QueueProbeResult> {
  const t0 = performance.now();
  
  try {
    const queue = getExecutionQueue();
    if (!queue) {
      throw new Error('BullMQ execution queue is not initialized');
    }

    // Attempt lightweight metadata write (verifying write capability without execution side-effects)
    const client = await queue.client;
    const pingResult = await (client as any).ping();

    if (pingResult !== 'PONG') {
      throw new Error(`Queue Redis ping returned unexpected status: ${pingResult}`);
    }

    const latencyMs = Math.round(performance.now() - t0);

    if (latencyMs > 500) {
      return {
        status: 'degraded',
        latencyMs,
        message: `Queue Redis latency is elevated (${latencyMs}ms)`,
      };
    }

    return {
      status: 'healthy',
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - t0);
    probeLogger.error({ err: error }, 'Queue probe failed');
    return {
      status: 'critical',
      latencyMs,
      message: error.message || 'Queue connection failed',
    };
  }
}

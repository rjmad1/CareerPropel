import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';
import { createLogger } from '@/lib/logging/logger';
import { transitionExecutionState } from '@/lib/runtime/execution-state-machine';
import { logEventToLedger } from '@/lib/runtime/ledger';
import { runtimeSettings } from '@/lib/runtime/settings';

const recLogger = createLogger({ component: 'operational-recovery' });

const STUCK_EXECUTION_THRESHOLD_MS = runtimeSettings.executionTimeoutMs; // 15 minutes by default

/**
 * Sweeps and recovers executions that have been stranded in 'running' or 'queued' state for too long.
 */
export async function recoverStuckExecutions(): Promise<number> {
  const stuckBefore = new Date(Date.now() - STUCK_EXECUTION_THRESHOLD_MS);

  const stuckExecutions = await prisma.agentExecution.findMany({
    where: {
      status: 'running',
      startedAt: { lt: stuckBefore },
    },
    select: { id: true, userId: true, correlationId: true },
  });

  let recoveredCount = 0;

  for (const ex of stuckExecutions) {
    try {
      recLogger.warn({ executionId: ex.id }, 'Recovering stuck execution: transitioning to failed');
      
      await transitionExecutionState(ex.id, 'failed', {
        actor: 'auto-recovery',
        userId: ex.userId,
        justification: `Stuck execution automatically recovered after exceeding timeout threshold of ${STUCK_EXECUTION_THRESHOLD_MS}ms`,
        correlationId: ex.correlationId || undefined,
      });

      await prisma.agentExecution.update({
        where: { id: ex.id },
        data: {
          errorMessage: 'Execution timed out (automatically recovered by system)',
        },
      });

      await logEventToLedger({
        executionId: ex.id,
        eventType: 'execution:auto_recovered',
        payload: { reason: 'stuck_timeout', thresholdMs: STUCK_EXECUTION_THRESHOLD_MS },
        correlationId: ex.correlationId,
        sourceRuntime: 'recovery',
      });

      recoveredCount++;
    } catch (err) {
      recLogger.error({ err, executionId: ex.id }, 'Failed to recover stuck execution');
    }
  }

  return recoveredCount;
}

/**
 * Reaps dead/stale worker heartbeat states from Redis.
 */
export async function recoverStaleHeartbeats(): Promise<number> {
  let recovered = 0;
  try {
    const keys = await redis.keys('heartbeat:*');
    const now = Date.now();

    for (const key of keys) {
      const val = await redis.get(key);
      if (val) {
        const { ts } = JSON.parse(val);
        // If heartbeat is older than heartbeatCriticalMs, delete the dead worker signature
        if (now - ts > runtimeSettings.heartbeatCriticalMs) {
          recLogger.warn({ workerKey: key }, 'Worker heartbeat stale. Removing dead registration.');
          await redis.del(key);
          recovered++;
        }
      }
    }
  } catch (error) {
    recLogger.error({ err: error }, 'Failed to recover stale heartbeats');
  }
  return recovered;
}

/**
 * Performs a full autonomous recovery cycle across all subsystems.
 */
export async function runAutonomousRecoverySweep(): Promise<{
  stuckRecovered: number;
  heartbeatsRecovered: number;
  timestamp: string;
}> {
  recLogger.info('Running background autonomous operational recovery sweep...');
  const stuckRecovered = await recoverStuckExecutions();
  const heartbeatsRecovered = await recoverStaleHeartbeats();

  return {
    stuckRecovered,
    heartbeatsRecovered,
    timestamp: new Date().toISOString(),
  };
}

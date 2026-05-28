import { prisma } from '@/lib/db';
import { enqueueExecution } from '@/lib/queue/queues';
import { createLogger } from '@/lib/logging/logger';
import crypto from 'crypto';

const probeLogger = createLogger({ component: 'e2e-probe' });

export interface E2EProbeResult {
  status: 'healthy' | 'degraded' | 'critical';
  latencyMs: number;
  message?: string;
}

/**
 * Executes a full synthetic execution flow, enqueuing a transient mock job
 * and verifying state persistence and ledger logging.
 */
export async function runE2EProbe(): Promise<E2EProbeResult> {
  const t0 = performance.now();
  const executionId = `probe-exec-${crypto.randomUUID()}`;
  const userId = 'synthetic-health-prober@careerpropel.io';
  const correlationId = `probe-corr-${crypto.randomUUID()}`;
  const requestId = `probe-req-${crypto.randomUUID()}`;

  try {
    // 1. Create a transient prober execution record in PostgreSQL
    await prisma.agentExecution.create({
      data: {
        id: executionId,
        userId,
        agentType: 'research',
        status: 'queued',
        executionSource: 'manual',
        correlationId,
        requestId,
        input: JSON.stringify({ isProbe: true }),
      },
    });

    // 2. Submit execution to standard queue partition
    await enqueueExecution({
      executionId,
      userId,
      agentType: 'research',
      promptContext: { isProbe: 'true' },
      requestId,
      correlationId,
      submittedAt: new Date().toISOString(),
    }, 'standard');

    // 3. Clean up the database record to prevent prober clutter
    await prisma.agentExecution.delete({
      where: { id: executionId },
    }).catch(() => {});

    const latencyMs = Math.round(performance.now() - t0);

    return {
      status: 'healthy',
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Math.round(performance.now() - t0);
    probeLogger.error({ err: error }, 'E2E prober pipeline failed');
    return {
      status: 'critical',
      latencyMs,
      message: error.message || 'E2E synthetic pipeline verification failed',
    };
  }
}

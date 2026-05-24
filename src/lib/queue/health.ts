import { prisma } from '@/lib/db';
import { getMetricsSnapshot } from '@/lib/observability/metrics';
import { redis } from '@/lib/redis/redisClient';
import { getQueueMetrics } from '@/lib/queue/queues';

export async function getHealthSnapshot() {
  const startedAt = Date.now();

  const [redisStatus, databaseStatus, queueMetrics] = await Promise.all([
    checkRedis(),
    checkDatabase(),
    getQueueMetrics(),
  ]);

  return {
    status:
      redisStatus.status === 'ok' && databaseStatus.status === 'ok' ? 'ok' : 'degraded',
    checks: {
      redis: redisStatus,
      database: databaseStatus,
      queue: queueMetrics,
    },
    metrics: getMetricsSnapshot(),
    durationMs: Date.now() - startedAt,
    timestamp: new Date().toISOString(),
  };
}

export async function getLivenessSnapshot() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}

export async function getReadinessSnapshot() {
  const [redisStatus, databaseStatus] = await Promise.all([checkRedis(), checkDatabase()]);
  const ready = redisStatus.status === 'ok' && databaseStatus.status === 'ok';

  return {
    status: ready ? 'ready' : 'not-ready',
    checks: {
      redis: redisStatus,
      database: databaseStatus,
    },
    timestamp: new Date().toISOString(),
  };
}

async function checkRedis() {
  try {
    const pong = await redis.ping();
    return { status: pong === 'PONG' ? 'ok' : 'error' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Redis ping failed',
    };
  }
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Database query failed',
    };
  }
}

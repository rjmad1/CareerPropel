import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';
import { log } from '@/lib/logging/logger';
import { createBullMQRedisConnection } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';

export type HealthStatus = 'healthy' | 'degraded' | 'unavailable';

export interface SubsystemHealth {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface AggregateHealth {
  overall: HealthStatus;
  subsystems: {
    database: SubsystemHealth;
    redis: SubsystemHealth;
    queue: SubsystemHealth;
    workers: SubsystemHealth;
  };
}

export async function checkDatabaseHealth(): Promise<SubsystemHealth> {
  const t0 = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - t0);
    if (latencyMs > 1000) {
      return { status: 'degraded', latencyMs, message: 'DB responding but slow' };
    }
    return { status: 'healthy', latencyMs };
  } catch (err: unknown) {
    log.error({ err }, 'Database health check failed');
    return { status: 'unavailable', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function checkRedisHealth(): Promise<SubsystemHealth> {
  const t0 = performance.now();
  try {
    await redis.ping();
    const latencyMs = Math.round(performance.now() - t0);
    if (latencyMs > 500) {
      return { status: 'degraded', latencyMs, message: 'Redis responding but slow' };
    }
    return { status: 'healthy', latencyMs };
  } catch (err: unknown) {
    log.error({ err }, 'Redis health check failed');
    return { status: 'unavailable', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function checkQueueHealth(): Promise<SubsystemHealth> {
  const t0 = performance.now();
  // Use a fresh connection per health check so it doesn't interfere with app clients.
  const conn = createBullMQRedisConnection();
  try {
    const { Queue } = await import('bullmq');
    const q = new Queue(runtimeSettings.executionQueueName, { connection: conn });
    const counts = await q.getJobCounts('waiting', 'active', 'failed');
    const paused = await q.isPaused();
    await q.close();
    const latencyMs = Math.round(performance.now() - t0);
    if (paused || latencyMs > 1000) {
      return { status: 'degraded', latencyMs, meta: { ...counts, paused }, message: paused ? 'Queue paused' : 'Queue slow' };
    }
    return { status: 'healthy', latencyMs, meta: { ...counts, paused } };
  } catch (err: unknown) {
    await conn.quit().catch(() => {});
    log.error({ err }, 'Queue health check failed');
    return { status: 'unavailable', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function checkWorkerHealth(): Promise<SubsystemHealth> {
  try {
    const keys = await redis.keys('heartbeat:*');
    const now = Date.now();
    let activeCount = 0;
    if (keys.length > 0) {
      const values = await redis.mget(...keys);
      for (const v of values) {
        if (!v) continue;
        const { ts } = JSON.parse(v) as { ts: number };
        if (now - ts < 30_000) activeCount++;
      }
    }
    if (activeCount > 0) {
      return { status: 'healthy', meta: { activeWorkers: activeCount } };
    }
    // No active workers — check if there's work waiting
    const queueHealth = await redis.get('queue:health');
    const queueSnapshot = queueHealth ? JSON.parse(queueHealth) : null;
    const waiting = queueSnapshot?.waiting ?? 0;
    if (waiting > 0) {
      return { status: 'degraded', message: 'No active workers but jobs are waiting', meta: { waiting } };
    }
    return { status: 'healthy', meta: { activeWorkers: 0, waiting: 0 } };
  } catch (err: unknown) {
    log.error({ err }, 'Worker health check failed');
    return { status: 'unavailable', message: err instanceof Error ? err.message : String(err) };
  }
}

export async function getAggregateHealth(): Promise<AggregateHealth> {
  const [database, redis, queue, workers] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkQueueHealth(),
    checkWorkerHealth(),
  ]);

  const subsystems = { database, redis, queue, workers };
  const statuses = Object.values(subsystems).map((s) => s.status);

  const overall: HealthStatus = statuses.includes('unavailable')
    ? 'unavailable'
    : statuses.includes('degraded')
    ? 'degraded'
    : 'healthy';

  return { overall, subsystems };
}

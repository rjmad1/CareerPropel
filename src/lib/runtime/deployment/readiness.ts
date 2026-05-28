import { checkDatabaseHealth, checkRedisHealth, checkQueueHealth } from '@/lib/health/checks';
import { createLogger } from '@/lib/logging/logger';

const readinessLogger = createLogger({ component: 'readiness-probe' });

export interface ReadinessProbeReport {
  ready: boolean;
  timestamp: string;
  checks: {
    database: boolean;
    redis: boolean;
    queue: boolean;
  };
  errors: string[];
}

/**
 * Executes a full readiness probe check.
 * This is used during Blue/Green rollouts to decide whether to cut over traffic.
 */
export async function executeReadinessProbe(): Promise<ReadinessProbeReport> {
  const report: ReadinessProbeReport = {
    ready: false,
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      redis: false,
      queue: false,
    },
    errors: [],
  };

  readinessLogger.info('Executing deployment readiness probe...');

  // 1. Check Database Health
  const dbHealth = await checkDatabaseHealth();
  if (dbHealth.status === 'healthy') {
    report.checks.database = true;
  } else {
    report.errors.push(`Database not ready: ${dbHealth.message || 'unknown error'}`);
  }

  // 2. Check Redis Health
  const redisHealth = await checkRedisHealth();
  if (redisHealth.status === 'healthy') {
    report.checks.redis = true;
  } else {
    report.errors.push(`Redis not ready: ${redisHealth.message || 'unknown error'}`);
  }

  // 3. Check Queue Health
  const queueHealth = await checkQueueHealth();
  if (queueHealth.status === 'healthy' || (queueHealth.status === 'degraded' && queueHealth.message !== 'Queue paused')) {
    report.checks.queue = true;
  } else {
    report.errors.push(`Queue not ready: ${queueHealth.message || 'unknown error'}`);
  }

  report.ready = Object.values(report.checks).every(Boolean);

  if (report.ready) {
    readinessLogger.info('✅ Readiness probe passed successfully.');
  } else {
    readinessLogger.error({ errors: report.errors }, '❌ Readiness probe FAILED.');
  }

  return report;
}

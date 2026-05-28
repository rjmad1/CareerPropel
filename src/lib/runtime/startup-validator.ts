import { prisma } from '@/lib/db';
import { createRedisClient } from '@/lib/redis/redisClient';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import { createLogger } from '@/lib/logging/logger';
import { verifyRuntimeCompatibility } from '@/lib/runtime/compatibility';

const startupLogger = createLogger({ component: 'startup-validator' });

export interface StartupValidationResult {
  passed: boolean;
  checks: {
    envVars: boolean;
    prisma: boolean;
    redis: boolean;
    queues: boolean;
    provider: boolean;
    compatibility: boolean;
  };
  errors: string[];
}

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'REDIS_URL',
  'NEXTAUTH_SECRET',
  'ANTHROPIC_API_KEY',
];

export async function validateStartup(): Promise<StartupValidationResult> {
  const result: StartupValidationResult = {
    passed: false,
    checks: {
      envVars: false,
      prisma: false,
      redis: false,
      queues: false,
      provider: false,
      compatibility: false,
    },
    errors: [],
  };

  startupLogger.info('Starting Early-Boot Platform Validation Gates...');

  // 1. Env Vars Validation
  try {
    const missing = REQUIRED_ENV_VARS.filter((v) => !process.env[v]);
    if (missing.length > 0) {
      throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
    }
    result.checks.envVars = true;
  } catch (err: any) {
    result.errors.push(`[ENV_VARS] ${err.message}`);
  }

  // 2. Prisma / Database Connectivity Check
  try {
    await prisma.$queryRaw`SELECT 1`;
    result.checks.prisma = true;
  } catch (err: any) {
    result.errors.push(`[PRISMA] Database connectivity check failed: ${err.message}`);
  }

  // 3. Redis Connectivity Check
  let tempRedis: ReturnType<typeof createRedisClient> | null = null;
  try {
    tempRedis = createRedisClient('career-propel:startup-ping');
    await Promise.race([
      new Promise<void>((resolve, reject) => {
        tempRedis!.ping().then((res) => {
          if (res === 'PONG') resolve();
          else reject(new Error(`Ping returned unexpected value: ${res}`));
        }).catch(reject);
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout (exceeded 1500ms)')), 1500)),
    ]);
    result.checks.redis = true;
  } catch (err: any) {
    result.errors.push(`[REDIS] Redis server ping failed: ${err.message}`);
  } finally {
    if (tempRedis) {
      try {
        await tempRedis.quit();
      } catch {
        // Ignored
      }
    }
  }

  // 4. BullMQ Queue Registration check
  try {
    const execQueue = getExecutionQueue();
    const dlq = getDeadLetterQueue();
    
    if (!execQueue || !dlq) {
      throw new Error('BullMQ queues are not registered or initialized');
    }

    const execPing = (await execQueue.client) as any;
    await execPing.ping();

    result.checks.queues = true;
  } catch (err: any) {
    result.errors.push(`[BULLMQ] Queue initialization check failed: ${err.message}`);
  }

  // 5. LLM Provider configuration check
  try {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || key.trim() === '') {
      throw new Error('Anthropic provider API key is empty');
    }
    result.checks.provider = true;
  } catch (err: any) {
    result.errors.push(`[PROVIDER] Provider credentials check failed: ${err.message}`);
  }

  // 6. Runtime Compatibility check
  try {
    const compResult = await verifyRuntimeCompatibility();
    result.checks.compatibility = compResult.compatible;
    if (!compResult.compatible) {
      result.errors.push(...compResult.errors);
    }
  } catch (err: any) {
    result.errors.push(`[COMPATIBILITY] Startup check failed: ${err.message}`);
  }

  // Determine pass status
  result.passed = Object.values(result.checks).every((c) => c === true);

  if (result.passed) {
    startupLogger.info('✅ Platform validation gates passed. Early boot operational status is healthy.');
  } else {
    startupLogger.error(
      { errors: result.errors },
      '❌ Plattform validation gates FAILED. Aborting startup to prevent undefined degraded behavior.'
    );
  }

  return result;
}

/**
 * High-priority fail-fast boot gate. Exits process immediately if check fails.
 */
export async function enforceStartupGates(): Promise<void> {
  const result = await validateStartup();
  if (!result.passed) {
    console.error('FATAL SYSTEM STARTUP FAILURE: Aborting boot process.');
    result.errors.forEach((err) => console.error(`  -> ${err}`));
    process.exit(1);
  }
}

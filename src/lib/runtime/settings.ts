export const runtimeSettings = {
  appName: process.env.APP_NAME || 'career-propel',
  logLevel: process.env.LOG_LEVEL || 'info',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  databaseUrl: process.env.DATABASE_URL || '',
  sseHeartbeatMs: Number(process.env.SSE_HEARTBEAT_MS || 15000),
  executionQueueName: process.env.EXECUTION_QUEUE_NAME || 'agent-execution',
  deadLetterQueueName: process.env.DEAD_LETTER_QUEUE_NAME || 'agent-execution-dlq',
  schedulerCleanupIntervalMs: Number(process.env.SCHEDULER_CLEANUP_INTERVAL_MS || 300000),
  executionTimeoutMs: Number(process.env.EXECUTION_TIMEOUT_MS || 900000),
  queueAttempts: Number(process.env.QUEUE_ATTEMPTS || 4),
  queueBackoffMs: Number(process.env.QUEUE_BACKOFF_MS || 5000),
  queueConcurrency: Number(process.env.QUEUE_CONCURRENCY || 5),
  queueMaxStalledCount: Number(process.env.QUEUE_MAX_STALLED_COUNT || 2),
  queueMetricsWindowMs: Number(process.env.QUEUE_METRICS_WINDOW_MS || 3600000),
  workerHeartbeatSeconds: Number(process.env.WORKER_HEARTBEAT_SECONDS || 30),
  providerCircuitBreakerThreshold: Number(process.env.PROVIDER_CIRCUIT_BREAKER_THRESHOLD || 5),
  providerCircuitBreakerResetMs: Number(process.env.PROVIDER_CIRCUIT_BREAKER_RESET_MS || 60000),
  providerMinIntervalMs: Number(process.env.PROVIDER_MIN_INTERVAL_MS || 0),
  maxQueuePayloadBytes: Number(process.env.MAX_QUEUE_PAYLOAD_BYTES || 32768),
  userConcurrencyLimit: Number(process.env.USER_CONCURRENCY_LIMIT || 2),
  agentConcurrencyLimit: Number(process.env.AGENT_CONCURRENCY_LIMIT || 5),
  queueBacklogWarningThreshold: Number(process.env.QUEUE_BACKLOG_WARNING_THRESHOLD || 20),
  dlqWarningThreshold: Number(process.env.DLQ_WARNING_THRESHOLD || 0),
  heartbeatStaleMs: Number(process.env.HEARTBEAT_STALE_MS || 60000),
  heartbeatCriticalMs: Number(process.env.HEARTBEAT_CRITICAL_MS || 120000),
  defaultPort: Number(process.env.PORT || 3000),
  defaultHostname: process.env.HOSTNAME || '0.0.0.0',
} as const;

export function getNumericEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

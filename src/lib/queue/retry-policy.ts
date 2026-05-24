import { JobsOptions } from 'bullmq';
import { runtimeSettings } from '@/lib/runtime/settings';

export class RetryableExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetryableExecutionError';
  }
}

export class NonRetryableExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableExecutionError';
  }
}

export class ConcurrencyLimitError extends RetryableExecutionError {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyLimitError';
  }
}

export class ProviderCircuitOpenError extends RetryableExecutionError {
  constructor(message: string) {
    super(message);
    this.name = 'ProviderCircuitOpenError';
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof NonRetryableExecutionError) {
    return false;
  }

  if (error instanceof RetryableExecutionError) {
    return true;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes('timeout') ||
    message.includes('rate limit') ||
    message.includes('temporarily unavailable') ||
    message.includes('connection') ||
    message.includes('network')
  );
}

export function createQueueJobOptions(overrides: Partial<JobsOptions> = {}): JobsOptions {
  return {
    attempts: runtimeSettings.queueAttempts,
    backoff: {
      type: 'exponential',
      delay: runtimeSettings.queueBackoffMs,
    },
    removeOnComplete: 1000,
    removeOnFail: 1000,
    ...overrides,
  };
}

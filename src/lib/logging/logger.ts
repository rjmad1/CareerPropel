/**
 * Structured Logger — CareerPropel
 *
 * Centralised pino-based logger. Replaces all console.* callsites throughout
 * the codebase. Respects LOG_LEVEL env var (default: 'info').
 *
 * Usage:
 *   import { log } from '@/lib/logging/logger';
 *   log.info({ userId: 'abc' }, 'User authenticated');
 *   log.error({ err, executionId }, 'Agent execution failed');
 *
 * DO NOT use console.log/warn/error anywhere in application code.
 * Structured fields enable log aggregators (Datadog, Logtail, etc.) to filter,
 * alert, and correlate across requests without manual grep.
 */

import pino from 'pino';
import { traceStore } from './traceContext';

const level = (process.env.LOG_LEVEL as pino.Level | undefined) ?? 'info';

/**
 * Root application logger.
 * In production, emits newline-delimited JSON.
 * In development, pretty-prints with pino-pretty if available; falls back to JSON.
 */
export const log = pino({
  level,
  // Redact any accidentally-passed PII field names at the root serializer level.
  redact: {
    paths: ['email', 'password', 'accessToken', 'refreshToken', 'secret', 'token'],
    censor: '[REDACTED]',
  },
  base: {
    // Remove pid/hostname from every log line — they add noise in serverless.
    pid: undefined,
    hostname: undefined,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    const store = traceStore.getStore();
    return store?.correlationId ? { correlationId: store.correlationId } : {};
  },
  formatters: {
    level(label) {
      return { level: label };
    },
  },
});

/**
 * Create a child logger pre-bound to a specific request/operation context.
 * Attach `requestId` so every downstream log line carries it automatically.
 *
 * @example
 *   const reqLog = childLog({ requestId: 'abc-123', userId: 'user-456' });
 *   reqLog.info('Processing agent execution');
 */
export function childLog(bindings: Record<string, unknown>) {
  return log.child(bindings);
}

/**
 * Safe wrapper for logging errors. Ensures the `Error` object is serialized
 * via pino's built-in `err` serializer (includes `message`, `stack`, `name`).
 */
export function logError(
  logger: typeof log,
  err: unknown,
  message: string,
  extra?: Record<string, unknown>
) {
  logger.error({ err: pino.stdSerializers.err(err as Error), ...extra }, message);
}

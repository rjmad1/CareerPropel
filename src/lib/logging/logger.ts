import pino from 'pino';
import { runtimeSettings } from '@/lib/runtime/settings';

export const logger = pino({
  name: runtimeSettings.appName,
  level: runtimeSettings.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'headers.authorization',
      'authorization',
      '*.authorization',
      '*.apiKey',
      '*.api_key',
      '*.password',
      '*.secret',
      '*.token',
      '*.cookies',
      '*.set-cookie',
      'payload',
      'response.body',
    ],
    censor: '[REDACTED]',
  },
});

export function createLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}

/** Alias for default logger — used by workflow modules */
export const log = logger;

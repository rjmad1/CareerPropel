import 'server-only';
import { RedisOptions } from 'ioredis';
import { env } from '@/config/env';
import { log } from '@/lib/logging/logger';

export interface RedisConfig extends RedisOptions {
  connectTimeout: number;
  maxRetryDelay: number;
  retryBudget: number;
}

/**
 * Enterprise Redis Client configuration.
 * Enforces lazyConnect to prevent connections during build/static generation phase.
 */
export const redisConfig: RedisConfig = {
  ...parseRedisUrl(env.REDIS_URL ?? ''),
  
  lazyConnect: true, // MANDATORY: Defer all socket connection requests
  maxRetriesPerRequest: null, // Required for blocking queue operations
  enableReadyCheck: false,
  
  // Connection timeout governance
  connectTimeout: 10000, // 10 seconds max connection wait
  
  // Bounded retries & retry budget limits
  maxRetryDelay: 5000, // Max delay between connection retries is 5 seconds
  retryBudget: 10, // Max number of retries before degrading
  
  retryStrategy(times: number) {
    if (times > redisConfig.retryBudget) {
      log.warn(
        { retryBudget: redisConfig.retryBudget },
        '[Redis Config] Retry budget exhausted. Gracefully degrading operations.'
      );
      return null; // Exhausted: return null to fail operation instead of looping infinitely
    }
    
    // Exponential backoff with jitter
    const delay = Math.min(times * 200 + Math.random() * 100, redisConfig.maxRetryDelay);
    log.warn(
      { attempt: times, delayMs: Math.round(delay) },
      '[Redis Config] Client disconnected. Attempting retry.'
    );
    return delay;
  }
};

/**
 * Parses the validated REDIS_URL into discrete Redis options.
 *
 * RASUI-010 remediation: TLS now uses rejectUnauthorized: true (the secure
 * default). For managed Redis services that use self-signed certificates
 * (Upstash, Redis Cloud), set REDIS_TLS_CA_CERT to the base64-encoded PEM
 * of the provider's CA certificate. This pins the CA rather than disabling
 * certificate validation entirely.
 *
 * Generate REDIS_TLS_CA_CERT:
 *   base64 -w 0 /path/to/ca.crt
 */
function parseRedisUrl(urlStr: string): Partial<RedisOptions> {
  try {
    const url = new URL(urlStr);

    // Build TLS options for rediss:// connections
    let tls: RedisOptions['tls'] | undefined;
    if (url.protocol === 'rediss:') {
      tls = { rejectUnauthorized: true }; // RASUI-010: certificate validation enabled

      // If a CA cert is provided, pin it instead of relying on the system CA bundle.
      // This supports self-signed certs from managed Redis providers without disabling validation.
      const caCertBase64 = process.env.REDIS_TLS_CA_CERT;
      if (caCertBase64) {
        tls.ca = Buffer.from(caCertBase64, 'base64');
      }
    }

    return {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      username: url.username || undefined,
      password: url.password || undefined,
      db: parseInt(url.pathname.substring(1) || '0'),
      tls,
    };
  } catch (err) {
    log.error(
      { err, redisUrl: urlStr.replace(/:[^:@]*@/, ':***@') }, // mask password in URL
      '[Redis Config] Error parsing REDIS_URL. Falling back to default settings.'
    );
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    };
  }
}

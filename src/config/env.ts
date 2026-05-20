import 'server-only';
import { z } from 'zod';

// Schema definition following strict enterprise governance rules
// Minimum length of 1 prevents empty string bypasses
const nonEmptyString = z.string().trim().min(1, "Required configuration value cannot be empty");
const validUrl = z.string().trim().url("Must be a valid URL format");

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: validUrl,
  REDIS_URL: validUrl,
  NEXTAUTH_URL: validUrl,
  NEXTAUTH_SECRET: nonEmptyString,
  BACKUP_CODE_HMAC_SECRET: nonEmptyString.default('dev-backup-code-hmac-secret-value-please-change-in-production'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Validates and caches the environment variables.
 * Fails fast with clear error reporting if the configuration is invalid.
 */
export function getEnv(): Env {
  if (!validatedEnv) {
    const result = envSchema.safeParse({
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      BACKUP_CODE_HMAC_SECRET: process.env.BACKUP_CODE_HMAC_SECRET,
      LOG_LEVEL: process.env.LOG_LEVEL,
    });

    if (!result.success) {
      console.error('❌ CRITICAL: Environment configuration validation failed!');
      console.error(JSON.stringify(result.error.format(), null, 2));
      throw new Error('Invalid environment variables. Application bootstrap terminated.');
    }
    validatedEnv = result.data;
  }
  return validatedEnv;
}

// Enterprise Lazy Singleton Proxy to defer parsing until first access
export const env = new Proxy({}, {
  get: (_, prop) => getEnv()[prop as keyof Env],
}) as Env;

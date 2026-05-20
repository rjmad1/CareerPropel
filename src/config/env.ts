import 'server-only';
import { z } from 'zod';

const validUrl = z.string().trim().url("Must be a valid URL format");
const strongSecret = z.string().trim().min(32, 'Secret must be at least 32 characters');
const hexKey32 = z.string().trim().length(64, 'Must be exactly 64 hex characters (32 bytes)');

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: validUrl,
  REDIS_URL: validUrl.optional(),
  NEXTAUTH_URL: validUrl,
  NEXTAUTH_SECRET: strongSecret,
  BACKUP_CODE_HMAC_SECRET: strongSecret,
  // RASUI-009: EXECUTOR_SECRET is required in production (fail-closed security posture)
  EXECUTOR_SECRET: strongSecret.optional(),
  // RASUI-002: CALENDAR_ENCRYPTION_KEY required in production for OAuth token encryption
  CALENDAR_ENCRYPTION_KEY: hexKey32.optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
}).superRefine((env, ctx) => {
  if (env.NODE_ENV === 'production') {
    if (!env.REDIS_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['REDIS_URL'],
        message: 'REDIS_URL is required in production',
      });
    }

    // RASUI-009: enforce EXECUTOR_SECRET in production
    if (!env.EXECUTOR_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EXECUTOR_SECRET'],
        message:
          'EXECUTOR_SECRET is required in production to secure the agent execution endpoint. ' +
          'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      });
    }

    // RASUI-002: enforce encryption key in production
    if (!env.CALENDAR_ENCRYPTION_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CALENDAR_ENCRYPTION_KEY'],
        message:
          'CALENDAR_ENCRYPTION_KEY is required in production for OAuth token encryption. ' +
          'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
      });
    }
  }
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
      EXECUTOR_SECRET: process.env.EXECUTOR_SECRET,
      CALENDAR_ENCRYPTION_KEY: process.env.CALENDAR_ENCRYPTION_KEY,
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

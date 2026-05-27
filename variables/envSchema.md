[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / envSchema

# Variable: envSchema

> `const` **envSchema**: `ZodEffects`\<`ZodObject`\<\{ `BACKUP_CODE_HMAC_SECRET`: `ZodString`; `CALENDAR_ENCRYPTION_KEY`: `ZodOptional`\<`ZodString`\>; `DATABASE_URL`: `ZodString`; `EXECUTOR_SECRET`: `ZodOptional`\<`ZodString`\>; `LOG_LEVEL`: `ZodDefault`\<`ZodEnum`\<\[`"debug"`, `"info"`, `"warn"`, `"error"`\]\>\>; `NEXTAUTH_SECRET`: `ZodString`; `NEXTAUTH_URL`: `ZodString`; `NODE_ENV`: `ZodDefault`\<`ZodEnum`\<\[`"development"`, `"production"`, `"test"`\]\>\>; `REDIS_URL`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `BACKUP_CODE_HMAC_SECRET`: `string`; `CALENDAR_ENCRYPTION_KEY?`: `string`; `DATABASE_URL`: `string`; `EXECUTOR_SECRET?`: `string`; `LOG_LEVEL`: `"info"` \| `"error"` \| `"warn"` \| `"debug"`; `NEXTAUTH_SECRET`: `string`; `NEXTAUTH_URL`: `string`; `NODE_ENV`: `"development"` \| `"production"` \| `"test"`; `REDIS_URL?`: `string`; \}, \{ `BACKUP_CODE_HMAC_SECRET`: `string`; `CALENDAR_ENCRYPTION_KEY?`: `string`; `DATABASE_URL`: `string`; `EXECUTOR_SECRET?`: `string`; `LOG_LEVEL?`: `"info"` \| `"error"` \| `"warn"` \| `"debug"`; `NEXTAUTH_SECRET`: `string`; `NEXTAUTH_URL`: `string`; `NODE_ENV?`: `"development"` \| `"production"` \| `"test"`; `REDIS_URL?`: `string`; \}\>, \{ `BACKUP_CODE_HMAC_SECRET`: `string`; `CALENDAR_ENCRYPTION_KEY?`: `string`; `DATABASE_URL`: `string`; `EXECUTOR_SECRET?`: `string`; `LOG_LEVEL`: `"info"` \| `"error"` \| `"warn"` \| `"debug"`; `NEXTAUTH_SECRET`: `string`; `NEXTAUTH_URL`: `string`; `NODE_ENV`: `"development"` \| `"production"` \| `"test"`; `REDIS_URL?`: `string`; \}, \{ `BACKUP_CODE_HMAC_SECRET`: `string`; `CALENDAR_ENCRYPTION_KEY?`: `string`; `DATABASE_URL`: `string`; `EXECUTOR_SECRET?`: `string`; `LOG_LEVEL?`: `"info"` \| `"error"` \| `"warn"` \| `"debug"`; `NEXTAUTH_SECRET`: `string`; `NEXTAUTH_URL`: `string`; `NODE_ENV?`: `"development"` \| `"production"` \| `"test"`; `REDIS_URL?`: `string`; \}\>

Defined in: [src/config/env.ts:8](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/config/env.ts#L8)

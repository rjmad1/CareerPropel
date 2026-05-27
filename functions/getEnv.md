[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getEnv

# Function: getEnv()

> **getEnv**(): `object`

Defined in: [src/config/env.ts:60](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/config/env.ts#L60)

Validates and caches the environment variables.
Fails fast with clear error reporting if the configuration is invalid.

## Returns

`object`

### BACKUP\_CODE\_HMAC\_SECRET

> **BACKUP\_CODE\_HMAC\_SECRET**: `string` = `strongSecret`

### CALENDAR\_ENCRYPTION\_KEY?

> `optional` **CALENDAR\_ENCRYPTION\_KEY?**: `string`

### DATABASE\_URL

> **DATABASE\_URL**: `string` = `validUrl`

### EXECUTOR\_SECRET?

> `optional` **EXECUTOR\_SECRET?**: `string`

### LOG\_LEVEL

> **LOG\_LEVEL**: `"info"` \| `"error"` \| `"warn"` \| `"debug"`

### NEXTAUTH\_SECRET

> **NEXTAUTH\_SECRET**: `string` = `strongSecret`

### NEXTAUTH\_URL

> **NEXTAUTH\_URL**: `string` = `validUrl`

### NODE\_ENV

> **NODE\_ENV**: `"development"` \| `"production"` \| `"test"`

### REDIS\_URL?

> `optional` **REDIS\_URL?**: `string`

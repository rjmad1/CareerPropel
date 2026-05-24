[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / REDIS\_CHANNELS

# Variable: REDIS\_CHANNELS

> `const` **REDIS\_CHANNELS**: `object`

Defined in: [src/lib/realtime/events.ts:132](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/realtime/events.ts#L132)

Redis channel names

## Type Declaration

### AGENT\_EXECUTIONS

> `readonly` **AGENT\_EXECUTIONS**: (`userId`) => `string`

#### Parameters

##### userId

`string`

#### Returns

`string`

### AGENT\_STATUS

> `readonly` **AGENT\_STATUS**: (`userId`) => `string`

#### Parameters

##### userId

`string`

#### Returns

`string`

### GLOBAL\_ERRORS

> `readonly` **GLOBAL\_ERRORS**: `"system:errors"` = `'system:errors'`

### HEARTBEAT

> `readonly` **HEARTBEAT**: `"system:heartbeat"` = `'system:heartbeat'`

### QUEUE\_STATS

> `readonly` **QUEUE\_STATS**: (`userId`) => `string`

#### Parameters

##### userId

`string`

#### Returns

`string`

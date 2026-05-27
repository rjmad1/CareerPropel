[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createActivity

# Function: createActivity()

> **createActivity**(`jobId`, `action`, `metadata?`): `Promise`\<\{ `action`: `string`; `createdAt`: `Date`; `id`: `string`; `jobId`: `string`; `metadata`: `JsonValue`; \}\>

Defined in: [src/lib/db/jobs.ts:203](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/db/jobs.ts#L203)

Create job activity (internal use)

## Parameters

### jobId

`string`

### action

`string`

### metadata?

`Record`\<`string`, `unknown`\> = `{}`

## Returns

`Promise`\<\{ `action`: `string`; `createdAt`: `Date`; `id`: `string`; `jobId`: `string`; `metadata`: `JsonValue`; \}\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createActivity

# Function: createActivity()

> **createActivity**(`jobId`, `action`, `metadata?`): `Promise`\<\{ `action`: `string`; `createdAt`: `Date`; `id`: `string`; `jobId`: `string`; `metadata`: `JsonValue`; \}\>

Defined in: [src/lib/db/jobs.ts:203](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/db/jobs.ts#L203)

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

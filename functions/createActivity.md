[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createActivity

# Function: createActivity()

> **createActivity**(`jobId`, `action`, `metadata?`): `Promise`\<\{ `action`: `string`; `createdAt`: `Date`; `id`: `string`; `jobId`: `string`; `metadata`: `JsonValue`; \}\>

Defined in: [src/lib/db/jobs.ts:203](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/jobs.ts#L203)

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

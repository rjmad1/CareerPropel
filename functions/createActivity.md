[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createActivity

# Function: createActivity()

> **createActivity**(`jobId`, `action`, `metadata?`): `Promise`\<\{ `action`: `string`; `createdAt`: `Date`; `id`: `string`; `jobId`: `string`; `metadata`: `JsonValue`; \}\>

Defined in: [src/lib/db/jobs.ts:206](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/db/jobs.ts#L206)

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

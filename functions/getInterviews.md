[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getInterviews

# Function: getInterviews()

> **getInterviews**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/interviews.ts:9](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/interviews.ts#L9)

Get interviews for a user with optional filtering

## Parameters

### userId

`string`

### query

#### jobId?

`string` = `...`

#### limit

`number` = `...`

#### offset

`number` = `...`

#### sortBy

`"createdAt"` \| `"scheduledAt"` = `...`

#### sortOrder

`"desc"` \| `"asc"` = `...`

#### status?

`string` = `...`

#### type?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

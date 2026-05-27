[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getJobs

# Function: getJobs()

> **getJobs**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/jobs.ts:10](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/jobs.ts#L10)

Get all jobs for a user with filtering, sorting, and pagination

## Parameters

### userId

`string`

### query

#### company?

`string` = `...`

#### limit

`number` = `...`

#### maxMatchScore?

`number` = `...`

#### maxSalary?

`number` = `...`

#### minMatchScore?

`number` = `...`

#### minSalary?

`number` = `...`

#### offset

`number` = `...`

#### priority?

`string` = `...`

#### sortBy

`"title"` \| `"company"` \| `"salary"` \| `"matchScore"` \| `"appliedAt"` \| `"updatedAt"` = `...`

#### sortOrder

`"desc"` \| `"asc"` = `...`

#### stage?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

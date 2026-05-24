[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getJobs

# Function: getJobs()

> **getJobs**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/jobs.ts:10](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/db/jobs.ts#L10)

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

`"updatedAt"` \| `"title"` \| `"company"` \| `"matchScore"` \| `"appliedAt"` \| `"salary"` = `...`

#### sortOrder

`"asc"` \| `"desc"` = `...`

#### stage?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

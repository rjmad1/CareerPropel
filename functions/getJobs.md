[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getJobs

# Function: getJobs()

> **getJobs**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/jobs.ts:10](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/db/jobs.ts#L10)

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

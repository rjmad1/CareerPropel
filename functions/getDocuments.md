[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getDocuments

# Function: getDocuments()

> **getDocuments**(`userId`, `query`): `Promise`\<\{ `data`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/documents.ts:7](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/documents.ts#L7)

Get documents for a user

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

`"name"` \| `"createdAt"` \| `"updatedAt"` = `...`

#### sortOrder

`"desc"` \| `"asc"` = `...`

#### type?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

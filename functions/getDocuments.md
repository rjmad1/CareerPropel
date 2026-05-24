[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getDocuments

# Function: getDocuments()

> **getDocuments**(`userId`, `query`): `Promise`\<\{ `data`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/documents.ts:7](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/db/documents.ts#L7)

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

`"asc"` \| `"desc"` = `...`

#### type?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

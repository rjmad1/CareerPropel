[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocument

# Function: uploadDocument()

> **uploadDocument**(`userId`, `data`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \}\>

Defined in: [src/lib/db/documents.ts:64](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/db/documents.ts#L64)

Upload a new document

## Parameters

### userId

`string`

### data

#### content

`string` = `...`

#### jobId?

`string` = `...`

#### name

`string` = `...`

#### tags?

`string`[] = `...`

#### type

`"other"` \| `"resume"` \| `"notes"` \| `"research"` \| `"cover_letter"` \| `"portfolio"` = `...`

#### version?

`string` = `...`

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \}\>

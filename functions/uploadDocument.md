[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocument

# Function: uploadDocument()

> **uploadDocument**(`userId`, `data`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \}\>

Defined in: [src/lib/db/documents.ts:64](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/db/documents.ts#L64)

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

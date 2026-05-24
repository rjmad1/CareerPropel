[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocument

# Function: uploadDocument()

> **uploadDocument**(`userId`, `data`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \}\>

Defined in: [src/lib/db/documents.ts:64](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/db/documents.ts#L64)

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

`"other"` \| `"research"` \| `"resume"` \| `"notes"` \| `"cover_letter"` \| `"portfolio"` = `...`

#### version?

`string` = `...`

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \}\>

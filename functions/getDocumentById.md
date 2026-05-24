[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getDocumentById

# Function: getDocumentById()

> **getDocumentById**(`userId`, `documentId`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

Defined in: [src/lib/db/documents.ts:49](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/db/documents.ts#L49)

Get a single document

## Parameters

### userId

`string`

### documentId

`string`

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

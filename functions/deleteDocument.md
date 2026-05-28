[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / deleteDocument

# Function: deleteDocument()

> **deleteDocument**(`userId`, `documentId`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

Defined in: [src/lib/db/documents.ts:81](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/db/documents.ts#L81)

Delete a document

## Parameters

### userId

`string`

### documentId

`string`

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

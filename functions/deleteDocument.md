[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / deleteDocument

# Function: deleteDocument()

> **deleteDocument**(`userId`, `documentId`): `Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

Defined in: [src/lib/db/documents.ts:81](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/db/documents.ts#L81)

Delete a document

## Parameters

### userId

`string`

### documentId

`string`

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `string` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `name`: `string`; `tags`: `string`[]; `type`: `string`; `updatedAt`: `Date`; `uploadedAt`: `Date`; `url`: `string` \| `null`; `version`: `string` \| `null`; \} \| `null`\>

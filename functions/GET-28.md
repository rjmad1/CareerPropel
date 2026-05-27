[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`, `context`): `Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/contacts/\[id\]/route.ts:21](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/contacts/[id]/route.ts#L21)

## Parameters

### \_req

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

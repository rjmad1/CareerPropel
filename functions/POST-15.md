[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/contacts/route.ts:53](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/contacts/route.ts#L53)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

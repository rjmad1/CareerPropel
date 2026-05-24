[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/contacts/route.ts:53](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/contacts/route.ts#L53)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `candidateId`: `string`; `company`: `string` \| `null`; `createdAt`: `Date`; `email`: `string` \| `null`; `followUpAt`: `Date` \| `null`; `id`: `string`; `jobId`: `string` \| `null`; `lastContactedAt`: `Date` \| `null`; `linkedInUrl`: `string` \| `null`; `name`: `string`; `notes`: `string` \| `null`; `phone`: `string` \| `null`; `role`: `string` \| `null`; `status`: `string`; `type`: `string`; `updatedAt`: `Date`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

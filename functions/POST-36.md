[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `candidateId`: `string`; `confidence`: `number` \| `null`; `createdAt`: `Date`; `data`: `JsonValue`; `id`: `string`; `source`: `string` \| `null`; `type`: `string`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/profile/entities/route.ts:47](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/profile/entities/route.ts#L47)

POST /api/profile/entities
Create a new profile entity

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `candidateId`: `string`; `confidence`: `number` \| `null`; `createdAt`: `Date`; `data`: `JsonValue`; `id`: `string`; `source`: `string` \| `null`; `type`: `string`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

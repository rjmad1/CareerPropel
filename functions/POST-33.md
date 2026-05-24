[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishment`: \{ `candidateId`: `string`; `category`: `string`; `createdAt`: `Date`; `date`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `string` \| `null`; `starContext`: `string` \| `null`; `title`: `string`; `updatedAt`: `Date`; `visibility`: `string`; \}; \}\>\>

Defined in: [src/app/api/profile/accomplishments/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/profile/accomplishments/route.ts#L46)

POST /api/profile/accomplishments
Create a new accomplishment log.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishment`: \{ `candidateId`: `string`; `category`: `string`; `createdAt`: `Date`; `date`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `string` \| `null`; `starContext`: `string` \| `null`; `title`: `string`; `updatedAt`: `Date`; `visibility`: `string`; \}; \}\>\>

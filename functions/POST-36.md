[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishment`: \{ `candidateId`: `string`; `category`: `string`; `createdAt`: `Date`; `date`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `string` \| `null`; `starContext`: `string` \| `null`; `title`: `string`; `updatedAt`: `Date`; `visibility`: `string`; \}; \}\>\>

Defined in: [src/app/api/profile/accomplishments/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/profile/accomplishments/route.ts#L46)

POST /api/profile/accomplishments
Create a new accomplishment log.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishment`: \{ `candidateId`: `string`; `category`: `string`; `createdAt`: `Date`; `date`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `string` \| `null`; `starContext`: `string` \| `null`; `title`: `string`; `updatedAt`: `Date`; `visibility`: `string`; \}; \}\>\>

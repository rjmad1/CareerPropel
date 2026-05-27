[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `emailScript`: `string`; `redLines`: `string`[]; `talkingPoints`: `string`[]; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/script/route.ts:20](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/offers/[id]/script/route.ts#L20)

POST /api/offers/[id]/script
Generate an AI negotiation script (email + talking points) for an offer.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `emailScript`: `string`; `redLines`: `string`[]; `talkingPoints`: `string`[]; \}\>\>\>

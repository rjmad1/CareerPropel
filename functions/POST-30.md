[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `emailScript`: `string`; `redLines`: `string`[]; `talkingPoints`: `string`[]; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/script/route.ts:20](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/offers/[id]/script/route.ts#L20)

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

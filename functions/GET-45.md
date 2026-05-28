[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `history`: `JsonArray`; `offerId`: `string`; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/negotiate/route.ts:104](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/offers/[id]/negotiate/route.ts#L104)

GET /api/offers/[id]/negotiate
Return full negotiation history for an offer.

## Parameters

### \_request

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `history`: `JsonArray`; `offerId`: `string`; \}\>\>\>

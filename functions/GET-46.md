[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `history`: `JsonArray`; `offerId`: `string`; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/negotiate/route.ts:104](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/offers/[id]/negotiate/route.ts#L104)

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

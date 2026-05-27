[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `history`: `JsonArray`; `offerId`: `string`; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/negotiate/route.ts:104](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/offers/[id]/negotiate/route.ts#L104)

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

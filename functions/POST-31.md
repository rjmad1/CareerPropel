[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `event`: \{ `action`: `"accept"` \| `"counter"` \| `"reject"` \| `"info_request"`; `counterAmount`: `number` \| `null`; `newStatus`: `OfferStatus`; `notes`: `string` \| `null`; `previousStatus`: `OfferStatus`; `timestamp`: `string`; \}; `offer`: `object` & `object`; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/negotiate/route.ts:21](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/offers/[id]/negotiate/route.ts#L21)

POST /api/offers/[id]/negotiate
Record a negotiation action on an offer.
Stores history as ProfileData JSON keyed by offer ID.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `event`: \{ `action`: `"accept"` \| `"counter"` \| `"reject"` \| `"info_request"`; `counterAmount`: `number` \| `null`; `newStatus`: `OfferStatus`; `notes`: `string` \| `null`; `previousStatus`: `OfferStatus`; `timestamp`: `string`; \}; `offer`: `object` & `object`; \}\>\>\>

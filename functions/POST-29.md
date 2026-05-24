[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`, `context`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `event`: \{ `action`: `"accept"` \| `"counter"` \| `"reject"` \| `"info_request"`; `counterAmount`: `number` \| `null`; `newStatus`: `OfferStatus`; `notes`: `string` \| `null`; `previousStatus`: `OfferStatus`; `timestamp`: `string`; \}; `offer`: `object` & `object`; \}\>\>\>

Defined in: [src/app/api/offers/\[id\]/negotiate/route.ts:21](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/offers/[id]/negotiate/route.ts#L21)

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

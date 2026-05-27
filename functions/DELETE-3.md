[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `disconnected`: `boolean`; `provider`: `string`; \}\>\>\>

Defined in: [src/app/api/calendar/sync/route.ts:35](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/calendar/sync/route.ts#L35)

DELETE /api/calendar/sync?provider=google|outlook
Disconnect the given provider (removes tokens + events).

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `disconnected`: `boolean`; `provider`: `string`; \}\>\>\>

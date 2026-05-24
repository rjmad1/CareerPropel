[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `disconnected`: `boolean`; `provider`: `string`; \}\>\>\>

Defined in: [src/app/api/calendar/sync/route.ts:35](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/calendar/sync/route.ts#L35)

DELETE /api/calendar/sync?provider=google|outlook
Disconnect the given provider (removes tokens + events).

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `disconnected`: `boolean`; `provider`: `string`; \}\>\>\>

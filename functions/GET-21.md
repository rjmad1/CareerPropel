[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `enabled`: `boolean`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/status/route.ts:8](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/auth/2fa/status/route.ts#L8)

GET /api/auth/2fa/status — returns whether 2FA is currently enabled

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `enabled`: `boolean`; \}\>\>\>

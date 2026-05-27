[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/disable/route.ts:19](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/auth/2fa/disable/route.ts#L19)

POST /api/auth/2fa/disable
Disable 2FA for the authenticated user. Requires current TOTP code to confirm.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/disable/route.ts:19](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/auth/2fa/disable/route.ts#L19)

POST /api/auth/2fa/disable
Disable 2FA for the authenticated user. Requires current TOTP code to confirm.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

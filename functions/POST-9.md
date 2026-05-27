[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/enable/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/auth/2fa/enable/route.ts#L24)

POST /api/auth/2fa/enable
Enable 2FA for the authenticated user
Protected: Requires authentication

Request body:
- secret: TOTP secret from setup
- totpCode: 6-digit code from authenticator app
- backupCodes: Array of backup codes from setup

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

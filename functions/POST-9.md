[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `message`: `string`; `success`: `boolean`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/enable/route.ts:27](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/auth/2fa/enable/route.ts#L27)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `backupCodes`: `string`[]; `message`: `string`; `qrCode`: `string`; `secret`: `string`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/setup/route.ts:19](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/auth/2fa/setup/route.ts#L19)

POST /api/auth/2fa/setup
Generate TOTP secret and backup codes for 2FA setup
Protected: Requires authentication

Returns:
- qrCode: Data URL for QR code
- secret: Base32 encoded secret (for manual entry)
- backupCodes: Array of backup codes

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `backupCodes`: `string`[]; `message`: `string`; `qrCode`: `string`; `secret`: `string`; \}\>\>\>

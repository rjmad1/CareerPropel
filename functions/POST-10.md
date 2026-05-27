[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `backupCodes`: `string`[]; `message`: `string`; `qrCode`: `string`; `secret`: `any`; \}\>\>\>

Defined in: [src/app/api/auth/2fa/setup/route.ts:16](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/auth/2fa/setup/route.ts#L16)

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

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `backupCodes`: `string`[]; `message`: `string`; `qrCode`: `string`; `secret`: `any`; \}\>\>\>

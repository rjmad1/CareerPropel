[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCurrentUser

# Function: getCurrentUser()

> **getCurrentUser**(`req`): `Promise`\<\{ `email`: `string`; `id`: `string`; \} \| `null`\>

Defined in: [src/app/api/middleware/auth.ts:7](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/middleware/auth.ts#L7)

Extract user from request headers
Supports both JWT Bearer tokens and session cookies

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<\{ `email`: `string`; `id`: `string`; \} \| `null`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`req`): `Promise`\<\{ `email`: `string`; `id`: `string`; \}\>

Defined in: [src/app/api/middleware/auth.ts:42](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/middleware/auth.ts#L42)

Verify user is authenticated
Returns user or throws 401

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<\{ `email`: `string`; `id`: `string`; \}\>

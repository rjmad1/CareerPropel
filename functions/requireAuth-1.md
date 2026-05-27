[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`_request`): `Promise`\<`Session`\>

Defined in: [src/lib/middleware/auth.ts:26](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/middleware/auth.ts#L26)

Middleware wrapper for protected endpoints
Usage:
  const session = await requireAuth(request)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`Session`\>

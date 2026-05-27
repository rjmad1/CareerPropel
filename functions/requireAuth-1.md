[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`_request`): `Promise`\<`Session`\>

Defined in: [src/lib/middleware/auth.ts:26](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/middleware/auth.ts#L26)

Middleware wrapper for protected endpoints
Usage:
  const session = await requireAuth(request)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`Session`\>

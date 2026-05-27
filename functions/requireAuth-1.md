[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`_request`): `Promise`\<`Session`\>

Defined in: [src/lib/middleware/auth.ts:26](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/middleware/auth.ts#L26)

Middleware wrapper for protected endpoints
Usage:
  const session = await requireAuth(request)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`Session`\>

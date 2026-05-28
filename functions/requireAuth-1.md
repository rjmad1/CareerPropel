[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`_request`): `Promise`\<`Session`\>

Defined in: [src/lib/middleware/auth.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/middleware/auth.ts#L26)

Middleware wrapper for protected endpoints
Usage:
  const session = await requireAuth(request)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`Session`\>

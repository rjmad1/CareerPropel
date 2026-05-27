[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`_request`): `Promise`\<`Session`\>

Defined in: [src/lib/middleware/auth.ts:26](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/middleware/auth.ts#L26)

Middleware wrapper for protected endpoints
Usage:
  const session = await requireAuth(request)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`Session`\>

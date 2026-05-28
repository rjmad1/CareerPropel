[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / requireAuth

# Function: requireAuth()

> **requireAuth**(`req`): `Promise`\<\{ `email`: `string`; `id`: `string`; \}\>

Defined in: [src/app/api/middleware/auth.ts:42](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/middleware/auth.ts#L42)

Verify user is authenticated
Returns user or throws 401

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<\{ `email`: `string`; `id`: `string`; \}\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCurrentUser

# Function: getCurrentUser()

> **getCurrentUser**(`req`): `Promise`\<\{ `email`: `string`; `id`: `string`; \} \| `null`\>

Defined in: [src/app/api/middleware/auth.ts:7](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/middleware/auth.ts#L7)

Extract user from request headers
Supports both JWT Bearer tokens and session cookies

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<\{ `email`: `string`; `id`: `string`; \} \| `null`\>

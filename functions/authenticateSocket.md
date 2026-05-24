[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / authenticateSocket

# Function: authenticateSocket()

> **authenticateSocket**(`socket`): `Promise`\<\{ `candidateId`: `string`; `userEmail`: `string`; `userId`: `string`; \} \| `null`\>

Defined in: [src/lib/socket/auth.ts:12](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/socket/auth.ts#L12)

Authenticate WebSocket connections using verified NextAuth JWT from the
session cookie. The previous base64(email:id) scheme was unsigned and
trivially forgeable — any caller could impersonate any user.

## Parameters

### socket

`Socket`

## Returns

`Promise`\<\{ `candidateId`: `string`; `userEmail`: `string`; `userId`: `string`; \} \| `null`\>

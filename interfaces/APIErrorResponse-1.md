[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / APIErrorResponse

# Interface: APIErrorResponse

Defined in: [src/lib/api/client.ts:7](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/api/client.ts#L7)

API Client
Fetch wrapper with error handling and token refresh logic.
Authentication is handled by NextAuth session cookies — no manual token management needed.

## Properties

### code

> **code**: `string`

Defined in: [src/lib/api/client.ts:8](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/api/client.ts#L8)

***

### details?

> `optional` **details?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/api/client.ts:10](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/api/client.ts#L10)

***

### message

> **message**: `string`

Defined in: [src/lib/api/client.ts:9](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/api/client.ts#L9)

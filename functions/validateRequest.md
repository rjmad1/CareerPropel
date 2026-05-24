[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / validateRequest

# Function: validateRequest()

> **validateRequest**\<`T`\>(`req`, `schema`): `Promise`\<\{ `data`: `ReturnType`\<`T`\[`"_output"`\]\>; `valid`: `true`; \} \| \{ `error`: [`ValidationError`](../classes/ValidationError.md); `valid`: `false`; \}\>

Defined in: [src/app/api/middleware/validation.ts:10](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/middleware/validation.ts#L10)

Validate request body against Zod schema
Returns properly typed data based on schema

## Type Parameters

### T

`T` *extends* `ZodType`\<`any`, `ZodTypeDef`, `any`\>

## Parameters

### req

`NextRequest`

### schema

`T`

## Returns

`Promise`\<\{ `data`: `ReturnType`\<`T`\[`"_output"`\]\>; `valid`: `true`; \} \| \{ `error`: [`ValidationError`](../classes/ValidationError.md); `valid`: `false`; \}\>

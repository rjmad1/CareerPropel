[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / validateRequest

# Function: validateRequest()

> **validateRequest**\<`T`\>(`req`, `schema`): `Promise`\<\{ `data`: `ReturnType`\<`T`\[`"_output"`\]\>; `valid`: `true`; \} \| \{ `error`: [`ValidationError`](../classes/ValidationError.md); `valid`: `false`; \}\>

Defined in: [src/app/api/middleware/validation.ts:10](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/middleware/validation.ts#L10)

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

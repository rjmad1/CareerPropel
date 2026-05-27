[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listOffersQuerySchema

# Variable: listOffersQuerySchema

> `const` **listOffersQuerySchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"salary"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"salary"`; `sortOrder`: `"desc"` \| `"asc"`; `status?`: `string`; \}, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"salary"`; `sortOrder?`: `"desc"` \| `"asc"`; `status?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:197](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/validation/schemas.ts#L197)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listOffersQuerySchema

# Variable: listOffersQuerySchema

> `const` **listOffersQuerySchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"salary"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"salary"`; `sortOrder`: `"desc"` \| `"asc"`; `status?`: `string`; \}, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"salary"`; `sortOrder?`: `"desc"` \| `"asc"`; `status?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:197](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validation/schemas.ts#L197)

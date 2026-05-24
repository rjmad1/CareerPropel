[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listOffersQuerySchema

# Variable: listOffersQuerySchema

> `const` **listOffersQuerySchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"salary"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"salary"`; `sortOrder`: `"asc"` \| `"desc"`; `status?`: `string`; \}, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"salary"`; `sortOrder?`: `"asc"` \| `"desc"`; `status?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:197](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/validation/schemas.ts#L197)

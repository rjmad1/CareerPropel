[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listOffersQuerySchema

# Variable: listOffersQuerySchema

> `const` **listOffersQuerySchema**: `ZodObject`\<\{ `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"salary"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"salary"`; `sortOrder`: `"asc"` \| `"desc"`; `status?`: `string`; \}, \{ `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"salary"`; `sortOrder?`: `"asc"` \| `"desc"`; `status?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:197](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/validation/schemas.ts#L197)

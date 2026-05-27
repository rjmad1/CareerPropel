[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listDocumentsQuerySchema

# Variable: listDocumentsQuerySchema

> `const` **listDocumentsQuerySchema**: `ZodObject`\<\{ `jobId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"createdAt"`, `"updatedAt"`, `"name"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `jobId?`: `string`; `limit`: `number`; `offset`: `number`; `sortBy`: `"name"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder`: `"desc"` \| `"asc"`; `type?`: `string`; \}, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"name"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `type?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:217](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validation/schemas.ts#L217)

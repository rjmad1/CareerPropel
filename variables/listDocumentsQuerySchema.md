[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listDocumentsQuerySchema

# Variable: listDocumentsQuerySchema

> `const` **listDocumentsQuerySchema**: `ZodObject`\<\{ `jobId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"createdAt"`, `"updatedAt"`, `"name"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `jobId?`: `string`; `limit`: `number`; `offset`: `number`; `sortBy`: `"name"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder`: `"desc"` \| `"asc"`; `type?`: `string`; \}, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"name"` \| `"createdAt"` \| `"updatedAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `type?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:217](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/validation/schemas.ts#L217)

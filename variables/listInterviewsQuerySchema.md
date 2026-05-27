[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listInterviewsQuerySchema

# Variable: listInterviewsQuerySchema

> `const` **listInterviewsQuerySchema**: `ZodObject`\<\{ `jobId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"scheduledAt"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `jobId?`: `string`; `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"scheduledAt"`; `sortOrder`: `"desc"` \| `"asc"`; `status?`: `string`; `type?`: `string`; \}, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"scheduledAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `status?`: `string`; `type?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:134](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/validation/schemas.ts#L134)

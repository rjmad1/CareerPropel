[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listInterviewsQuerySchema

# Variable: listInterviewsQuerySchema

> `const` **listInterviewsQuerySchema**: `ZodObject`\<\{ `jobId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"scheduledAt"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `jobId?`: `string`; `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"scheduledAt"`; `sortOrder`: `"desc"` \| `"asc"`; `status?`: `string`; `type?`: `string`; \}, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"scheduledAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `status?`: `string`; `type?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:134](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/validation/schemas.ts#L134)

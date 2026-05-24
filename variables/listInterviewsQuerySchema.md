[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listInterviewsQuerySchema

# Variable: listInterviewsQuerySchema

> `const` **listInterviewsQuerySchema**: `ZodObject`\<\{ `jobId`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"scheduledAt"`, `"createdAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `status`: `ZodOptional`\<`ZodString`\>; `type`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `jobId?`: `string`; `limit`: `number`; `offset`: `number`; `sortBy`: `"createdAt"` \| `"scheduledAt"`; `sortOrder`: `"asc"` \| `"desc"`; `status?`: `string`; `type?`: `string`; \}, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `sortBy?`: `"createdAt"` \| `"scheduledAt"`; `sortOrder?`: `"asc"` \| `"desc"`; `status?`: `string`; `type?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:134](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/validation/schemas.ts#L134)

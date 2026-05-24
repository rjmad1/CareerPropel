[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listJobsQuerySchema

# Variable: listJobsQuerySchema

> `const` **listJobsQuerySchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `maxMatchScore`: `ZodOptional`\<`ZodNumber`\>; `maxSalary`: `ZodOptional`\<`ZodNumber`\>; `minMatchScore`: `ZodOptional`\<`ZodNumber`\>; `minSalary`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `priority`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"matchScore"`, `"appliedAt"`, `"salary"`, `"company"`, `"title"`, `"updatedAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `limit`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset`: `number`; `priority?`: `string`; `sortBy`: `"updatedAt"` \| `"title"` \| `"company"` \| `"matchScore"` \| `"appliedAt"` \| `"salary"`; `sortOrder`: `"asc"` \| `"desc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `limit?`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset?`: `number`; `priority?`: `string`; `sortBy?`: `"updatedAt"` \| `"title"` \| `"company"` \| `"matchScore"` \| `"appliedAt"` \| `"salary"`; `sortOrder?`: `"asc"` \| `"desc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:71](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/validation/schemas.ts#L71)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listJobsQuerySchema

# Variable: listJobsQuerySchema

> `const` **listJobsQuerySchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `maxMatchScore`: `ZodOptional`\<`ZodNumber`\>; `maxSalary`: `ZodOptional`\<`ZodNumber`\>; `minMatchScore`: `ZodOptional`\<`ZodNumber`\>; `minSalary`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `priority`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"matchScore"`, `"appliedAt"`, `"salary"`, `"company"`, `"title"`, `"updatedAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `limit`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset`: `number`; `priority?`: `string`; `sortBy`: `"title"` \| `"company"` \| `"salary"` \| `"matchScore"` \| `"appliedAt"` \| `"updatedAt"`; `sortOrder`: `"desc"` \| `"asc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `limit?`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset?`: `number`; `priority?`: `string`; `sortBy?`: `"title"` \| `"company"` \| `"salary"` \| `"matchScore"` \| `"appliedAt"` \| `"updatedAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:71](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validation/schemas.ts#L71)

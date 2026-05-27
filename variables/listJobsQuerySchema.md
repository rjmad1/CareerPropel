[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listJobsQuerySchema

# Variable: listJobsQuerySchema

> `const` **listJobsQuerySchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `maxMatchScore`: `ZodOptional`\<`ZodNumber`\>; `maxSalary`: `ZodOptional`\<`ZodNumber`\>; `minMatchScore`: `ZodOptional`\<`ZodNumber`\>; `minSalary`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `priority`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"matchScore"`, `"appliedAt"`, `"salary"`, `"company"`, `"title"`, `"updatedAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `limit`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset`: `number`; `priority?`: `string`; `sortBy`: `"title"` \| `"company"` \| `"salary"` \| `"matchScore"` \| `"appliedAt"` \| `"updatedAt"`; `sortOrder`: `"desc"` \| `"asc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `limit?`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset?`: `number`; `priority?`: `string`; `sortBy?`: `"title"` \| `"company"` \| `"salary"` \| `"matchScore"` \| `"appliedAt"` \| `"updatedAt"`; `sortOrder?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:71](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/validation/schemas.ts#L71)

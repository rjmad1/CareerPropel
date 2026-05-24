[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / listJobsQuerySchema

# Variable: listJobsQuerySchema

> `const` **listJobsQuerySchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `limit`: `ZodDefault`\<`ZodNumber`\>; `maxMatchScore`: `ZodOptional`\<`ZodNumber`\>; `maxSalary`: `ZodOptional`\<`ZodNumber`\>; `minMatchScore`: `ZodOptional`\<`ZodNumber`\>; `minSalary`: `ZodOptional`\<`ZodNumber`\>; `offset`: `ZodDefault`\<`ZodNumber`\>; `priority`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodDefault`\<`ZodEnum`\<\[`"matchScore"`, `"appliedAt"`, `"salary"`, `"company"`, `"title"`, `"updatedAt"`\]\>\>; `sortOrder`: `ZodDefault`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `limit`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset`: `number`; `priority?`: `string`; `sortBy`: `"updatedAt"` \| `"title"` \| `"company"` \| `"matchScore"` \| `"appliedAt"` \| `"salary"`; `sortOrder`: `"asc"` \| `"desc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `limit?`: `number`; `maxMatchScore?`: `number`; `maxSalary?`: `number`; `minMatchScore?`: `number`; `minSalary?`: `number`; `offset?`: `number`; `priority?`: `string`; `sortBy?`: `"updatedAt"` \| `"title"` \| `"company"` \| `"matchScore"` \| `"appliedAt"` \| `"salary"`; `sortOrder?`: `"asc"` \| `"desc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:71](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/validation/schemas.ts#L71)

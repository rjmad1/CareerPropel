[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobFilterSchema

# Variable: JobFilterSchema

> `const` **JobFilterSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `search`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodOptional`\<`ZodString`\>; `sortDir`: `ZodOptional`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:95](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validations/job.ts#L95)

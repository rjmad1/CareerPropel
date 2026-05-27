[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobFilterSchema

# Variable: JobFilterSchema

> `const` **JobFilterSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `search`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodOptional`\<`ZodString`\>; `sortDir`: `ZodOptional`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"desc"` \| `"asc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:95](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/validations/job.ts#L95)

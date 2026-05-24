[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobFilterSchema

# Variable: JobFilterSchema

> `const` **JobFilterSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `search`: `ZodOptional`\<`ZodString`\>; `sortBy`: `ZodOptional`\<`ZodString`\>; `sortDir`: `ZodOptional`\<`ZodEnum`\<\[`"asc"`, `"desc"`\]\>\>; `stage`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"asc"` \| `"desc"`; `stage?`: `string`; \}, \{ `company?`: `string`; `search?`: `string`; `sortBy?`: `string`; `sortDir?`: `"asc"` \| `"desc"`; `stage?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:95](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/validations/job.ts#L95)

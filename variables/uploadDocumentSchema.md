[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocumentSchema

# Variable: uploadDocumentSchema

> `const` **uploadDocumentSchema**: `ZodObject`\<\{ `content`: `ZodString`; `jobId`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `type`: `ZodEnum`\<\[`"resume"`, `"cover_letter"`, `"portfolio"`, `"research"`, `"notes"`, `"other"`\]\>; `version`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"resume"` \| `"notes"` \| `"research"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"resume"` \| `"notes"` \| `"research"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:208](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validation/schemas.ts#L208)

Documents Domain Schemas

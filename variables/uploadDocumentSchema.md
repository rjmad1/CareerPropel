[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocumentSchema

# Variable: uploadDocumentSchema

> `const` **uploadDocumentSchema**: `ZodObject`\<\{ `content`: `ZodString`; `jobId`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `type`: `ZodEnum`\<\[`"resume"`, `"cover_letter"`, `"portfolio"`, `"research"`, `"notes"`, `"other"`\]\>; `version`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"research"` \| `"resume"` \| `"notes"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"research"` \| `"resume"` \| `"notes"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:208](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/validation/schemas.ts#L208)

Documents Domain Schemas

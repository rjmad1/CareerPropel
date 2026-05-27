[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / uploadDocumentSchema

# Variable: uploadDocumentSchema

> `const` **uploadDocumentSchema**: `ZodObject`\<\{ `content`: `ZodString`; `jobId`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; `tags`: `ZodOptional`\<`ZodArray`\<`ZodString`, `"many"`\>\>; `type`: `ZodEnum`\<\[`"resume"`, `"cover_letter"`, `"portfolio"`, `"research"`, `"notes"`, `"other"`\]\>; `version`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"resume"` \| `"notes"` \| `"research"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}, \{ `content`: `string`; `jobId?`: `string`; `name`: `string`; `tags?`: `string`[]; `type`: `"other"` \| `"resume"` \| `"notes"` \| `"research"` \| `"cover_letter"` \| `"portfolio"`; `version?`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:208](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/validation/schemas.ts#L208)

Documents Domain Schemas

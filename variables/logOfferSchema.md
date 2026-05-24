[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logOfferSchema

# Variable: logOfferSchema

> `const` **logOfferSchema**: `ZodObject`\<\{ `benefits`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `description`: `ZodOptional`\<`ZodString`\>; `name`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `description?`: `string`; `name`: `string`; \}, \{ `description?`: `string`; `name`: `string`; \}\>, `"many"`\>\>; `bonus`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `type`: `ZodOptional`\<`ZodEnum`\<\[`"cash"`, `"percentage"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}\>\>; `equity`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `cliffMonths`: `ZodOptional`\<`ZodNumber`\>; `vestingYears`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}\>\>; `jobId`: `ZodString`; `negotiated`: `ZodDefault`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; `salary`: `ZodNumber`; `startDate`: `ZodOptional`\<`ZodString`\>; `status`: `ZodDefault`\<`ZodEnum`\<\[`"received"`, `"accepted"`, `"rejected"`, `"pending"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `benefits?`: `object`[]; `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `jobId`: `string`; `negotiated`: `boolean`; `notes?`: `string`; `salary`: `number`; `startDate?`: `string`; `status`: `"received"` \| `"pending"` \| `"rejected"` \| `"accepted"`; \}, \{ `benefits?`: `object`[]; `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `jobId`: `string`; `negotiated?`: `boolean`; `notes?`: `string`; `salary`: `number`; `startDate?`: `string`; `status?`: `"received"` \| `"pending"` \| `"rejected"` \| `"accepted"`; \}\>

Defined in: [src/lib/validation/schemas.ts:147](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/validation/schemas.ts#L147)

Offers Domain Schemas

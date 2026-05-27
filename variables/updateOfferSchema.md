[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateOfferSchema

# Variable: updateOfferSchema

> `const` **updateOfferSchema**: `ZodObject`\<\{ `bonus`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `type`: `ZodOptional`\<`ZodEnum`\<\[`"cash"`, `"percentage"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}\>\>; `equity`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `cliffMonths`: `ZodOptional`\<`ZodNumber`\>; `vestingYears`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}\>\>; `negotiated`: `ZodOptional`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; `salary`: `ZodOptional`\<`ZodNumber`\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"received"`, `"accepted"`, `"rejected"`, `"pending"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `negotiated?`: `boolean`; `notes?`: `string`; `salary?`: `number`; `status?`: `"rejected"` \| `"received"` \| `"pending"` \| `"accepted"`; \}, \{ `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `negotiated?`: `boolean`; `notes?`: `string`; `salary?`: `number`; `status?`: `"rejected"` \| `"received"` \| `"pending"` \| `"accepted"`; \}\>

Defined in: [src/lib/validation/schemas.ts:177](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/validation/schemas.ts#L177)

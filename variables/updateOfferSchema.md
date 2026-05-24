[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateOfferSchema

# Variable: updateOfferSchema

> `const` **updateOfferSchema**: `ZodObject`\<\{ `bonus`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `type`: `ZodOptional`\<`ZodEnum`\<\[`"cash"`, `"percentage"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}, \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}\>\>; `equity`: `ZodOptional`\<`ZodObject`\<\{ `amount`: `ZodOptional`\<`ZodNumber`\>; `cliffMonths`: `ZodOptional`\<`ZodNumber`\>; `vestingYears`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}, \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}\>\>; `negotiated`: `ZodOptional`\<`ZodBoolean`\>; `notes`: `ZodOptional`\<`ZodString`\>; `salary`: `ZodOptional`\<`ZodNumber`\>; `status`: `ZodOptional`\<`ZodEnum`\<\[`"received"`, `"accepted"`, `"rejected"`, `"pending"`\]\>\>; \}, `"strip"`, `ZodTypeAny`, \{ `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `negotiated?`: `boolean`; `notes?`: `string`; `salary?`: `number`; `status?`: `"received"` \| `"pending"` \| `"rejected"` \| `"accepted"`; \}, \{ `bonus?`: \{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \}; `equity?`: \{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \}; `negotiated?`: `boolean`; `notes?`: `string`; `salary?`: `number`; `status?`: `"received"` \| `"pending"` \| `"rejected"` \| `"accepted"`; \}\>

Defined in: [src/lib/validation/schemas.ts:177](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/validation/schemas.ts#L177)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createJobSchema

# Variable: createJobSchema

> `const` **createJobSchema**: `ZodObject`\<\{ `applicationUrl`: `ZodOptional`\<`ZodString`\>; `company`: `ZodString`; `description`: `ZodString`; `location`: `ZodString`; `matchScore`: `ZodOptional`\<`ZodNumber`\>; `notes`: `ZodOptional`\<`ZodString`\>; `recruiter`: `ZodOptional`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `name`: `ZodOptional`\<`ZodString`\>; `phone`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `name?`: `string`; `phone?`: `string`; \}, \{ `email?`: `string`; `name?`: `string`; `phone?`: `string`; \}\>\>; `salary`: `ZodOptional`\<`ZodNumber`\>; `salaryRange`: `ZodOptional`\<`ZodObject`\<\{ `max`: `ZodOptional`\<`ZodNumber`\>; `min`: `ZodOptional`\<`ZodNumber`\>; \}, `"strip"`, `ZodTypeAny`, \{ `max?`: `number`; `min?`: `number`; \}, \{ `max?`: `number`; `min?`: `number`; \}\>\>; `source`: `ZodOptional`\<`ZodString`\>; `title`: `ZodString`; \}, `"strip"`, `ZodTypeAny`, \{ `applicationUrl?`: `string`; `company`: `string`; `description`: `string`; `location`: `string`; `matchScore?`: `number`; `notes?`: `string`; `recruiter?`: \{ `email?`: `string`; `name?`: `string`; `phone?`: `string`; \}; `salary?`: `number`; `salaryRange?`: \{ `max?`: `number`; `min?`: `number`; \}; `source?`: `string`; `title`: `string`; \}, \{ `applicationUrl?`: `string`; `company`: `string`; `description`: `string`; `location`: `string`; `matchScore?`: `number`; `notes?`: `string`; `recruiter?`: \{ `email?`: `string`; `name?`: `string`; `phone?`: `string`; \}; `salary?`: `number`; `salaryRange?`: \{ `max?`: `number`; `min?`: `number`; \}; `source?`: `string`; `title`: `string`; \}\>

Defined in: [src/lib/validation/schemas.ts:3](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/validation/schemas.ts#L3)

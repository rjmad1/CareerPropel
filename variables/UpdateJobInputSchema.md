[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UpdateJobInputSchema

# Variable: UpdateJobInputSchema

> `const` **UpdateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"offer"` \| `"sourced"` \| `"applied"` \| `"interested"` \| `"resume_tailoring"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"offer"` \| `"sourced"` \| `"applied"` \| `"interested"` \| `"resume_tailoring"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:51](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/validations/job.ts#L51)

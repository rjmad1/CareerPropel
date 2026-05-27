[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UpdateJobInputSchema

# Variable: UpdateJobInputSchema

> `const` **UpdateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:51](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/validations/job.ts#L51)

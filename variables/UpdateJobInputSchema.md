[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UpdateJobInputSchema

# Variable: UpdateJobInputSchema

> `const` **UpdateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:51](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/validations/job.ts#L51)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UpdateJobInputSchema

# Variable: UpdateJobInputSchema

> `const` **UpdateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:51](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/validations/job.ts#L51)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / CreateJobInputSchema

# Variable: CreateJobInputSchema

> `const` **CreateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodString`; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodDefault`\<`ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>\>; `title`: `ZodString`; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company`: `string`; `notes?`: `string`; `stage`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title`: `string`; `url?`: `string`; \}, \{ `company`: `string`; `notes?`: `string`; `stage?`: `"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:8](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/validations/job.ts#L8)

Job validation schemas
Centralized validation for all job-related endpoints

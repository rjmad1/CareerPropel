[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UpdateJobInputSchema

# Variable: UpdateJobInputSchema

> `const` **UpdateJobInputSchema**: `ZodObject`\<\{ `company`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; `stage`: `ZodOptional`\<`ZodEnum`\<\[`"sourced"`, `"interested"`, `"resume_tailoring"`, `"applied"`, `"recruiter_screen"`, `"hiring_manager"`, `"technical_interview"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"offer"`, `"negotiation"`, `"rejected"`, `"archived"`\]\>\>; `title`: `ZodOptional`\<`ZodString`\>; `url`: `ZodUnion`\<\[`ZodOptional`\<`ZodString`\>, `ZodLiteral`\<`""`\>\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"offer"` \| `"sourced"` \| `"applied"` \| `"interested"` \| `"resume_tailoring"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}, \{ `company?`: `string`; `notes?`: `string`; `stage?`: `"offer"` \| `"sourced"` \| `"applied"` \| `"interested"` \| `"resume_tailoring"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"negotiation"` \| `"rejected"` \| `"archived"`; `title?`: `string`; `url?`: `string`; \}\>

Defined in: [src/lib/validations/job.ts:51](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/validations/job.ts#L51)

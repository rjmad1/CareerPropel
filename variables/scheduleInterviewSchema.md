[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scheduleInterviewSchema

# Variable: scheduleInterviewSchema

> `const` **scheduleInterviewSchema**: `ZodObject`\<\{ `duration`: `ZodDefault`\<`ZodOptional`\<`ZodNumber`\>\>; `interviewer`: `ZodOptional`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodString`\>; `name`: `ZodOptional`\<`ZodString`\>; `title`: `ZodOptional`\<`ZodString`\>; \}, `"strip"`, `ZodTypeAny`, \{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \}, \{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \}\>\>; `jobId`: `ZodString`; `location`: `ZodOptional`\<`ZodString`\>; `meetingLink`: `ZodOptional`\<`ZodString`\>; `notes`: `ZodOptional`\<`ZodString`\>; `reminders`: `ZodOptional`\<`ZodArray`\<`ZodObject`\<\{ `minutesBefore`: `ZodNumber`; `type`: `ZodEnum`\<\[`"email"`, `"sms"`, `"push"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `minutesBefore`: `number`; `type`: `"push"` \| `"email"` \| `"sms"`; \}, \{ `minutesBefore`: `number`; `type`: `"push"` \| `"email"` \| `"sms"`; \}\>, `"many"`\>\>; `scheduledAt`: `ZodString`; `type`: `ZodEnum`\<\[`"recruiter_screen"`, `"technical"`, `"system_design"`, `"behavioral"`, `"final_round"`, `"other"`\]\>; \}, `"strip"`, `ZodTypeAny`, \{ `duration`: `number`; `interviewer?`: \{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \}; `jobId`: `string`; `location?`: `string`; `meetingLink?`: `string`; `notes?`: `string`; `reminders?`: `object`[]; `scheduledAt`: `string`; `type`: `"other"` \| `"behavioral"` \| `"technical"` \| `"recruiter_screen"` \| `"system_design"` \| `"final_round"`; \}, \{ `duration?`: `number`; `interviewer?`: \{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \}; `jobId`: `string`; `location?`: `string`; `meetingLink?`: `string`; `notes?`: `string`; `reminders?`: `object`[]; `scheduledAt`: `string`; `type`: `"other"` \| `"behavioral"` \| `"technical"` \| `"recruiter_screen"` \| `"system_design"` \| `"final_round"`; \}\>

Defined in: [src/lib/validation/schemas.ts:90](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/validation/schemas.ts#L90)

Interviews Domain Schemas

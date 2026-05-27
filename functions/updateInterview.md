[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateInterview

# Function: updateInterview()

> **updateInterview**(`userId`, `interviewId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/interviews.ts:146](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/interviews.ts#L146)

Update an interview

## Parameters

### userId

`string`

### interviewId

`string`

### data

#### duration?

`number` = `...`

#### feedback?

\{ `nextSteps?`: `string`; `notes?`: `string`; `rating?`: `number`; \} = `...`

#### feedback.nextSteps?

`string` = `...`

#### feedback.notes?

`string` = `...`

#### feedback.rating?

`number` = `...`

#### interviewer?

\{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \} = `...`

#### interviewer.email?

`string` = `...`

#### interviewer.name?

`string` = `...`

#### interviewer.title?

`string` = `...`

#### location?

`string` = `...`

#### meetingLink?

`string` = `...`

#### notes?

`string` = `...`

#### scheduledAt?

`string` = `...`

#### status?

`"completed"` \| `"scheduled"` \| `"cancelled"` \| `"no_show"` = `...`

#### type?

`"other"` \| `"behavioral"` \| `"technical"` \| `"recruiter_screen"` \| `"system_design"` \| `"final_round"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>

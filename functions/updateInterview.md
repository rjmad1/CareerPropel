[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateInterview

# Function: updateInterview()

> **updateInterview**(`userId`, `interviewId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/interviews.ts:146](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/db/interviews.ts#L146)

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

`"other"` \| `"recruiter_screen"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"technical"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>

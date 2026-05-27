[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scheduleInterview

# Function: scheduleInterview()

> **scheduleInterview**(`userId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/interviews.ts:79](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/db/interviews.ts#L79)

Schedule a new interview

## Parameters

### userId

`string`

### data

#### duration

`number` = `...`

#### interviewer?

\{ `email?`: `string`; `name?`: `string`; `title?`: `string`; \} = `...`

#### interviewer.email?

`string` = `...`

#### interviewer.name?

`string` = `...`

#### interviewer.title?

`string` = `...`

#### jobId

`string` = `...`

#### location?

`string` = `...`

#### meetingLink?

`string` = `...`

#### notes?

`string` = `...`

#### reminders?

`object`[] = `...`

#### scheduledAt

`string` = `...`

#### type

`"other"` \| `"behavioral"` \| `"technical"` \| `"recruiter_screen"` \| `"system_design"` \| `"final_round"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>

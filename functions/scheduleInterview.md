[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scheduleInterview

# Function: scheduleInterview()

> **scheduleInterview**(`userId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/interviews.ts:79](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/db/interviews.ts#L79)

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

`"other"` \| `"recruiter_screen"` \| `"system_design"` \| `"behavioral"` \| `"final_round"` \| `"technical"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>

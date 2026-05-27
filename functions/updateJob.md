[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateJob

# Function: updateJob()

> **updateJob**(`userId`, `jobId`, `data`): `Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \} \| `null`\>

Defined in: [src/lib/db/jobs.ts:150](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/db/jobs.ts#L150)

Update a job

## Parameters

### userId

`string`

### jobId

`string`

### data

#### company?

`string` = `...`

#### description?

`string` = `...`

#### location?

`string` = `...`

#### matchScore?

`number` = `...`

#### notes?

`string` = `...`

#### priority?

`"high"` \| `"low"` \| `"medium"` = `...`

#### recruiter?

\{ `email?`: `string`; `name?`: `string`; `phone?`: `string`; \} = `...`

#### recruiter.email?

`string` = `...`

#### recruiter.name?

`string` = `...`

#### recruiter.phone?

`string` = `...`

#### salary?

`number` = `...`

#### salaryRange?

\{ `max?`: `number`; `min?`: `number`; \} = `...`

#### salaryRange.max?

`number` = `...`

#### salaryRange.min?

`number` = `...`

#### stage?

`"behavioral"` \| `"sourced"` \| `"interested"` \| `"resume_tailoring"` \| `"applied"` \| `"recruiter_screen"` \| `"hiring_manager"` \| `"technical_interview"` \| `"system_design"` \| `"final_round"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"` = `...`

#### status?

`"rejected"` \| `"archived"` \| `"active"` \| `"offered"` = `...`

#### title?

`string` = `...`

## Returns

`Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \} \| `null`\>

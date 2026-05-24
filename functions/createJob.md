[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createJob

# Function: createJob()

> **createJob**(`userId`, `data`): `Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \}\>

Defined in: [src/lib/db/jobs.ts:121](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/db/jobs.ts#L121)

Create a new job

## Parameters

### userId

`string`

### data

#### applicationUrl?

`string` = `...`

#### company

`string` = `...`

#### description

`string` = `...`

#### location

`string` = `...`

#### matchScore?

`number` = `...`

#### notes?

`string` = `...`

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

#### source?

`string` = `...`

#### title

`string` = `...`

## Returns

`Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \}\>

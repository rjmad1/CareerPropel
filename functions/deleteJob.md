[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / deleteJob

# Function: deleteJob()

> **deleteJob**(`userId`, `jobId`): `Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \} \| `null`\>

Defined in: [src/lib/db/jobs.ts:180](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/db/jobs.ts#L180)

Delete (archive) a job

## Parameters

### userId

`string`

### jobId

`string`

## Returns

`Promise`\<\{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \} \| `null`\>

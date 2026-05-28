[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `agentType`: [`AgentType`](../type-aliases/AgentType.md) \| `null`; `executionId`: `string` \| `null`; `job`: \{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \}; \}\>\>

Defined in: [src/app/api/jobs/\[id\]/move/route.ts:20](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/jobs/[id]/move/route.ts#L20)

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `agentType`: [`AgentType`](../type-aliases/AgentType.md) \| `null`; `executionId`: `string` \| `null`; `job`: \{ `appliedAt`: `Date` \| `null`; `candidateId`: `string`; `company`: `string`; `createdAt`: `Date`; `description`: `string` \| `null`; `id`: `string`; `location`: `string` \| `null`; `matchScore`: `number` \| `null`; `notes`: `string` \| `null`; `priority`: `string`; `recruiterEmail`: `string` \| `null`; `recruiterName`: `string` \| `null`; `recruiterPhone`: `string` \| `null`; `salary`: `number` \| `null`; `stage`: `JobStage`; `tags`: `string`[]; `title`: `string`; `updatedAt`: `Date`; `url`: `string` \| `null`; \}; \}\>\>

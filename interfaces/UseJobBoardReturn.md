[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseJobBoardReturn

# Interface: UseJobBoardReturn

Defined in: [src/hooks/useJobBoard.ts:13](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L13)

## Properties

### addJob

> **addJob**: (`job`) => `void`

Defined in: [src/hooks/useJobBoard.ts:18](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L18)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### deleteJob

> **deleteJob**: (`id`) => `void`

Defined in: [src/hooks/useJobBoard.ts:20](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L20)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useJobBoard.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L17)

***

### getJobById

> **getJobById**: (`id`) => [`Job`](Job-1.md) \| `undefined`

Defined in: [src/hooks/useJobBoard.ts:23](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L23)

#### Parameters

##### id

`string`

#### Returns

[`Job`](Job-1.md) \| `undefined`

***

### getJobsByStage

> **getJobsByStage**: (`stage`) => [`Job`](Job-1.md)[]

Defined in: [src/hooks/useJobBoard.ts:24](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L24)

#### Parameters

##### stage

`"behavioral"` \| `"system-design"` \| `"sourced"` \| `"interested"` \| `"applied"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"` \| `"resume-tailoring"` \| `"recruiter-screen"` \| `"hiring-manager"` \| `"technical-interview"` \| `"final-round"`

#### Returns

[`Job`](Job-1.md)[]

***

### jobs

> **jobs**: [`Job`](Job-1.md)[]

Defined in: [src/hooks/useJobBoard.ts:14](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L14)

***

### loading

> **loading**: `boolean`

Defined in: [src/hooks/useJobBoard.ts:16](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L16)

***

### moveJob

> **moveJob**: (`id`, `newStage`) => `void`

Defined in: [src/hooks/useJobBoard.ts:21](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L21)

#### Parameters

##### id

`string`

##### newStage

`"behavioral"` \| `"system-design"` \| `"sourced"` \| `"interested"` \| `"applied"` \| `"offer"` \| `"negotiation"` \| `"rejected"` \| `"archived"` \| `"resume-tailoring"` \| `"recruiter-screen"` \| `"hiring-manager"` \| `"technical-interview"` \| `"final-round"`

#### Returns

`void`

***

### selectedJobId

> **selectedJobId**: `string` \| `null`

Defined in: [src/hooks/useJobBoard.ts:15](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L15)

***

### selectJob

> **selectJob**: (`id`) => `void`

Defined in: [src/hooks/useJobBoard.ts:22](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L22)

#### Parameters

##### id

`string` \| `null`

#### Returns

`void`

***

### updateJob

> **updateJob**: (`id`, `updates`) => `void`

Defined in: [src/hooks/useJobBoard.ts:19](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useJobBoard.ts#L19)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`Job`](Job-1.md)\>

#### Returns

`void`

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseJobBoardReturn

# Interface: UseJobBoardReturn

Defined in: [src/hooks/useJobBoard.ts:10](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L10)

## Properties

### addJob

> **addJob**: (`job`) => `void`

Defined in: [src/hooks/useJobBoard.ts:15](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L15)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### deleteJob

> **deleteJob**: (`id`) => `void`

Defined in: [src/hooks/useJobBoard.ts:17](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L17)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useJobBoard.ts:14](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L14)

***

### getJobById

> **getJobById**: (`id`) => [`Job`](Job-1.md) \| `undefined`

Defined in: [src/hooks/useJobBoard.ts:20](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L20)

#### Parameters

##### id

`string`

#### Returns

[`Job`](Job-1.md) \| `undefined`

***

### getJobsByStage

> **getJobsByStage**: (`stage`) => [`Job`](Job-1.md)[]

Defined in: [src/hooks/useJobBoard.ts:21](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L21)

#### Parameters

##### stage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

[`Job`](Job-1.md)[]

***

### jobs

> **jobs**: [`Job`](Job-1.md)[]

Defined in: [src/hooks/useJobBoard.ts:11](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L11)

***

### loading

> **loading**: `boolean`

Defined in: [src/hooks/useJobBoard.ts:13](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L13)

***

### moveJob

> **moveJob**: (`id`, `newStage`) => `Promise`\<[`MoveResult`](MoveResult.md)\>

Defined in: [src/hooks/useJobBoard.ts:18](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L18)

#### Parameters

##### id

`string`

##### newStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`Promise`\<[`MoveResult`](MoveResult.md)\>

***

### refetch

> **refetch**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useJobBoard.ts:22](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L22)

#### Returns

`Promise`\<`void`\>

***

### selectedJobId

> **selectedJobId**: `string` \| `null`

Defined in: [src/hooks/useJobBoard.ts:12](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L12)

***

### selectJob

> **selectJob**: (`id`) => `void`

Defined in: [src/hooks/useJobBoard.ts:19](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L19)

#### Parameters

##### id

`string` \| `null`

#### Returns

`void`

***

### updateJob

> **updateJob**: (`id`, `updates`) => `void`

Defined in: [src/hooks/useJobBoard.ts:16](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useJobBoard.ts#L16)

#### Parameters

##### id

`string`

##### updates

`Partial`\<[`Job`](Job-1.md)\>

#### Returns

`void`

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobQueue

# Class: JobQueue

Defined in: [src/lib/queues/jobQueue.ts:45](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L45)

## Constructors

### Constructor

> **new JobQueue**(`config?`): `JobQueue`

Defined in: [src/lib/queues/jobQueue.ts:48](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L48)

#### Parameters

##### config?

`Partial`\<`QueueConfig`\> = `{}`

#### Returns

`JobQueue`

## Methods

### complete()

> **complete**(`queuedJobId`, `result`): `Promise`\<`void`\>

Defined in: [src/lib/queues/jobQueue.ts:122](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L122)

#### Parameters

##### queuedJobId

`string`

##### result

`any`

#### Returns

`Promise`\<`void`\>

***

### dequeueNext()

> **dequeueNext**(`agentType`): `Promise`\<[`QueuedJob`](../interfaces/QueuedJob.md) \| `null`\>

Defined in: [src/lib/queues/jobQueue.ts:86](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L86)

#### Parameters

##### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

#### Returns

`Promise`\<[`QueuedJob`](../interfaces/QueuedJob.md) \| `null`\>

***

### enqueue()

> **enqueue**(`agentType`, `jobId`, `userId`, `payload`, `priority?`): `Promise`\<`string`\>

Defined in: [src/lib/queues/jobQueue.ts:52](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L52)

#### Parameters

##### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

##### jobId

`string`

##### userId

`string`

##### payload

`Record`\<`string`, `any`\>

##### priority?

`number` = `5`

#### Returns

`Promise`\<`string`\>

***

### fail()

> **fail**(`queuedJobId`, `error`): `Promise`\<`boolean`\>

Defined in: [src/lib/queues/jobQueue.ts:145](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L145)

#### Parameters

##### queuedJobId

`string`

##### error

`string`

#### Returns

`Promise`\<`boolean`\>

***

### getStats()

> **getStats**(`agentType?`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [src/lib/queues/jobQueue.ts:189](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L189)

#### Parameters

##### agentType?

[`AgentType`](../type-aliases/AgentType-1.md)

#### Returns

`Promise`\<`Record`\<`string`, `any`\>\>

***

### watchJobCompletion()

> **watchJobCompletion**(`jobId`, `callback`): `void`

Defined in: [src/lib/queues/jobQueue.ts:218](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/queues/jobQueue.ts#L218)

Watch for completion of a specific job via Redis pub/sub.

RASUI-011 fix: The subscriber is now stored and cleaned up on BOTH the
success and error paths. The previous implementation only disconnected on
success, causing subscriber connections to leak permanently on any error.

#### Parameters

##### jobId

`string`

##### callback

(`job`) => `void`

#### Returns

`void`

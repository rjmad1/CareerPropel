[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentCompleted

# Function: publishAgentCompleted()

> **publishAgentCompleted**(`userId`, `executionId`, `agentType`, `status`, `output`, `error?`, `tokensUsed?`, `durationMs?`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:91](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/redis-integration.ts#L91)

Publish agent completed event to Redis

## Parameters

### userId

`string`

### executionId

`string`

### agentType

[`ExtendedAgentType`](../type-aliases/ExtendedAgentType.md)

### status

`"success"` \| `"failed"`

### output

`Record`\<`string`, `any`\> \| `undefined`

### error?

`string`

### tokensUsed?

`number` = `0`

### durationMs?

`number` = `0`

## Returns

`Promise`\<`void`\>

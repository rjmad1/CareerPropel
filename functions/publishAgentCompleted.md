[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentCompleted

# Function: publishAgentCompleted()

> **publishAgentCompleted**(`userId`, `executionId`, `agentType`, `status`, `output`, `error?`, `tokensUsed?`, `durationMs?`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:102](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/agents/redis-integration.ts#L102)

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

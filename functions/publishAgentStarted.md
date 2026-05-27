[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStarted

# Function: publishAgentStarted()

> **publishAgentStarted**(`userId`, `executionId`, `agentType`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:64](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/agents/redis-integration.ts#L64)

Publish agent started event to Redis

## Parameters

### userId

`string`

### executionId

`string`

### agentType

[`ExtendedAgentType`](../type-aliases/ExtendedAgentType.md)

### input

`Record`\<`string`, `any`\>

## Returns

`Promise`\<`void`\>

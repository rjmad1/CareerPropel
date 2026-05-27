[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStarted

# Function: publishAgentStarted()

> **publishAgentStarted**(`userId`, `executionId`, `agentType`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:64](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/agents/redis-integration.ts#L64)

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

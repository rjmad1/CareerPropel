[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStarted

# Function: publishAgentStarted()

> **publishAgentStarted**(`userId`, `executionId`, `agentType`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:63](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/agents/redis-integration.ts#L63)

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

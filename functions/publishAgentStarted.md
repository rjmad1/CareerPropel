[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStarted

# Function: publishAgentStarted()

> **publishAgentStarted**(`userId`, `executionId`, `agentType`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:70](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agents/redis-integration.ts#L70)

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

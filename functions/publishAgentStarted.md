[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStarted

# Function: publishAgentStarted()

> **publishAgentStarted**(`userId`, `executionId`, `agentType`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:64](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/agents/redis-integration.ts#L64)

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

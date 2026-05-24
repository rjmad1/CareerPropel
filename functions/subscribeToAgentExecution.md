[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToAgentExecution

# Function: subscribeToAgentExecution()

> **subscribeToAgentExecution**(`executionId`, `onUpdate`, `onError?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:134](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/agent/agentService.ts#L134)

Subscribe to agent execution updates via EventSource
Returns cleanup function to unsubscribe

## Parameters

### executionId

`string`

### onUpdate

(`event`) => `void`

### onError?

(`error`) => `void`

## Returns

() => `void`

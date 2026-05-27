[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToAgentExecution

# Function: subscribeToAgentExecution()

> **subscribeToAgentExecution**(`executionId`, `onUpdate`, `onError?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:134](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/agent/agentService.ts#L134)

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

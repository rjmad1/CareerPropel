[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToAgentExecution

# Function: subscribeToAgentExecution()

> **subscribeToAgentExecution**(`executionId`, `onUpdate`, `onError?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:134](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L134)

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

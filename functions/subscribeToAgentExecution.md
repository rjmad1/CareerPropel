[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToAgentExecution

# Function: subscribeToAgentExecution()

> **subscribeToAgentExecution**(`executionId`, `onUpdate`, `onError?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:134](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/agent/agentService.ts#L134)

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

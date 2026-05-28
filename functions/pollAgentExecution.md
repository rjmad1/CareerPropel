[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / pollAgentExecution

# Function: pollAgentExecution()

> **pollAgentExecution**(`executionId`, `onUpdate`, `options?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:187](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L187)

Poll for execution updates (fallback when EventSource unavailable)
Returns cleanup function

## Parameters

### executionId

`string`

### onUpdate

(`response`) => `void`

### options?

#### interval?

`number`

#### maxAttempts?

`number`

#### onError?

(`error`) => `void`

## Returns

() => `void`

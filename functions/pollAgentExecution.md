[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / pollAgentExecution

# Function: pollAgentExecution()

> **pollAgentExecution**(`executionId`, `onUpdate`, `options?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:187](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/agent/agentService.ts#L187)

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

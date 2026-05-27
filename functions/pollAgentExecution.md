[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / pollAgentExecution

# Function: pollAgentExecution()

> **pollAgentExecution**(`executionId`, `onUpdate`, `options?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:187](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/agent/agentService.ts#L187)

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

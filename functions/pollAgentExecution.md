[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / pollAgentExecution

# Function: pollAgentExecution()

> **pollAgentExecution**(`executionId`, `onUpdate`, `options?`): () => `void`

Defined in: [src/lib/agent/agentService.ts:187](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agent/agentService.ts#L187)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentExecution

# Function: useAgentExecution()

> **useAgentExecution**(`executionId`, `options?`): [`UseAgentExecutionResult`](../interfaces/UseAgentExecutionResult.md)

Defined in: [src/hooks/useAgentExecution.ts:55](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useAgentExecution.ts#L55)

Hook for managing agent execution lifecycle

Features:
- Real-time updates via EventSource/WebSocket
- Fallback to polling
- Tool call tracking
- Event log pagination and filtering
- Pause/resume/cancel actions
- Auto-refresh when status changes

## Parameters

### executionId

`string`

### options?

#### autoSubscribe?

`boolean`

#### refreshInterval?

`number`

#### useSse?

`boolean`

## Returns

[`UseAgentExecutionResult`](../interfaces/UseAgentExecutionResult.md)

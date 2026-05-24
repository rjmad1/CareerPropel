[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentExecution

# Function: useAgentExecution()

> **useAgentExecution**(`executionId`, `options?`): [`UseAgentExecutionResult`](../interfaces/UseAgentExecutionResult.md)

Defined in: [src/hooks/useAgentExecution.ts:55](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/hooks/useAgentExecution.ts#L55)

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

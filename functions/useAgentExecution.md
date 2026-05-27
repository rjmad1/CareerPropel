[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentExecution

# Function: useAgentExecution()

> **useAgentExecution**(`executionId`, `options?`): [`UseAgentExecutionResult`](../interfaces/UseAgentExecutionResult.md)

Defined in: [src/hooks/useAgentExecution.ts:55](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L55)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentExecutionResponse

# Interface: AgentExecutionResponse

Defined in: [src/lib/agent/agentService.ts:13](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L13)

Agent Service - API client for agent execution operations

Handles:
- Fetching execution details with tool calls and logs
- Execution state mutations (pause, resume, cancel)
- Log pagination and filtering
- WebSocket subscription management

## Properties

### execution

> **execution**: [`AgentExecution`](AgentExecution.md)

Defined in: [src/lib/agent/agentService.ts:14](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L14)

***

### logs

> **logs**: [`EventLog`](EventLog.md)[]

Defined in: [src/lib/agent/agentService.ts:16](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L16)

***

### toolCalls

> **toolCalls**: [`ToolCall`](ToolCall.md)[]

Defined in: [src/lib/agent/agentService.ts:15](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L15)

***

### totalLogs

> **totalLogs**: `number`

Defined in: [src/lib/agent/agentService.ts:17](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L17)

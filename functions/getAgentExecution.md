[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentExecution

# Function: getAgentExecution()

> **getAgentExecution**(`executionId`, `options?`): `Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:30](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/agent/agentService.ts#L30)

Fetch complete execution with all tool calls and logs

## Parameters

### executionId

`string`

### options?

#### includeEvents?

`boolean`

#### includeToolCalls?

`boolean`

## Returns

`Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

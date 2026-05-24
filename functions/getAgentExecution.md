[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentExecution

# Function: getAgentExecution()

> **getAgentExecution**(`executionId`, `options?`): `Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:30](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agent/agentService.ts#L30)

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

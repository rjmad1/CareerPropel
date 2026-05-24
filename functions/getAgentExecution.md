[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentExecution

# Function: getAgentExecution()

> **getAgentExecution**(`executionId`, `options?`): `Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:30](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/agent/agentService.ts#L30)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentExecution

# Function: getAgentExecution()

> **getAgentExecution**(`executionId`, `options?`): `Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:30](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/agent/agentService.ts#L30)

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

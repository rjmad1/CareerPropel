[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentExecution

# Function: getAgentExecution()

> **getAgentExecution**(`executionId`, `options?`): `Promise`\<[`AgentExecutionResponse`](../interfaces/AgentExecutionResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:30](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/agent/agentService.ts#L30)

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

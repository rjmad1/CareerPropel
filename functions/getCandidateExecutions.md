[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidateExecutions

# Function: getCandidateExecutions()

> **getCandidateExecutions**(`candidateId`, `options?`): `Promise`\<\{ `executions`: [`AgentExecution`](../interfaces/AgentExecution.md)[]; `page`: `number`; `pageSize`: `number`; `total`: `number`; \}\>

Defined in: [src/lib/agent/agentService.ts:234](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/agent/agentService.ts#L234)

Get all executions for a candidate

## Parameters

### candidateId

`string`

### options?

#### page?

`number`

#### pageSize?

`number`

#### status?

`string`

## Returns

`Promise`\<\{ `executions`: [`AgentExecution`](../interfaces/AgentExecution.md)[]; `page`: `number`; `pageSize`: `number`; `total`: `number`; \}\>

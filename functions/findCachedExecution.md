[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / findCachedExecution

# Function: findCachedExecution()

> **findCachedExecution**(`userId`, `agentType`, `jobId`): `Promise`\<[`CoordinatorResult`](../interfaces/CoordinatorResult.md) \| `null`\>

Defined in: [src/lib/workflow/ai-coordinator.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/ai-coordinator.ts#L17)

Check if a recent completed execution exists for this agent+job.
Returns the cached result so the workflow can skip re-running the agent.

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType.md)

### jobId

`string` \| `undefined`

## Returns

`Promise`\<[`CoordinatorResult`](../interfaces/CoordinatorResult.md) \| `null`\>

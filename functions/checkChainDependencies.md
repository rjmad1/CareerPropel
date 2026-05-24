[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / checkChainDependencies

# Function: checkChainDependencies()

> **checkChainDependencies**(`agentType`, `userId`, `jobId`): `Promise`\<[`ChainContext`](../interfaces/ChainContext.md)\>

Defined in: [src/lib/agents/chainExecutor.ts:46](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L46)

Check whether all upstream dependencies for `agentType` are satisfied
for a given job.  Returns upstream outputs that can be merged into context.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

### userId

`string`

### jobId

`string`

## Returns

`Promise`\<[`ChainContext`](../interfaces/ChainContext.md)\>

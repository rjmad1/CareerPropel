[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / checkChainDependencies

# Function: checkChainDependencies()

> **checkChainDependencies**(`agentType`, `userId`, `jobId`): `Promise`\<[`ChainContext`](../interfaces/ChainContext.md)\>

Defined in: [src/lib/agents/chainExecutor.ts:46](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/agents/chainExecutor.ts#L46)

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

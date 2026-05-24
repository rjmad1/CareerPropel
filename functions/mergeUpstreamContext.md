[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / mergeUpstreamContext

# Function: mergeUpstreamContext()

> **mergeUpstreamContext**(`agentType`, `baseContext`, `upstreamOutputs`): `Record`\<`string`, `unknown`\>

Defined in: [src/lib/agents/chainExecutor.ts:97](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L97)

Merge upstream outputs into context so downstream agents receive
structured intel from their dependencies.

Example: research output → companyInfo string for interview-prep.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

### baseContext

`Record`\<`string`, `unknown`\>

### upstreamOutputs

`Record`\<`string`, `Record`\<`string`, `unknown`\>\>

## Returns

`Record`\<`string`, `unknown`\>

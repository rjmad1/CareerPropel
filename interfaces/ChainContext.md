[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ChainContext

# Interface: ChainContext

Defined in: [src/lib/agents/chainExecutor.ts:33](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L33)

## Properties

### pendingDeps

> **pendingDeps**: [`AgentType`](../type-aliases/AgentType.md)[]

Defined in: [src/lib/agents/chainExecutor.ts:39](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L39)

agentTypes that are still pending

***

### ready

> **ready**: `boolean`

Defined in: [src/lib/agents/chainExecutor.ts:37](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L37)

True if all dependencies are satisfied

***

### upstreamOutputs

> **upstreamOutputs**: `Record`\<`string`, `Record`\<`string`, `unknown`\>\>

Defined in: [src/lib/agents/chainExecutor.ts:35](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/chainExecutor.ts#L35)

Upstream agent output keyed by agentType

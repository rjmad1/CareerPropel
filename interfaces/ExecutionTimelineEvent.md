[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ExecutionTimelineEvent

# Interface: ExecutionTimelineEvent

Defined in: [src/types/agent.ts:131](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L131)

Agent execution timeline event

## Properties

### agent

> **agent**: [`AgentType`](../type-aliases/AgentType-2.md)

Defined in: [src/types/agent.ts:134](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L134)

***

### data

> **data**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:136](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L136)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/types/agent.ts:135](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L135)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/types/agent.ts:133](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L133)

***

### type

> **type**: `"completed"` \| `"failed"` \| `"paused"` \| `"resumed"` \| `"started"` \| `"tool_executed"` \| `"progress_update"`

Defined in: [src/types/agent.ts:132](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/types/agent.ts#L132)

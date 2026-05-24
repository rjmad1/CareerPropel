[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ExecutionTimelineEvent

# Interface: ExecutionTimelineEvent

Defined in: [src/types/agent.ts:131](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L131)

Agent execution timeline event

## Properties

### agent

> **agent**: [`AgentType`](../type-aliases/AgentType-3.md)

Defined in: [src/types/agent.ts:134](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L134)

***

### data

> **data**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:136](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L136)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/types/agent.ts:135](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L135)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/types/agent.ts:133](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L133)

***

### type

> **type**: `"completed"` \| `"failed"` \| `"paused"` \| `"resumed"` \| `"started"` \| `"tool_executed"` \| `"progress_update"`

Defined in: [src/types/agent.ts:132](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/types/agent.ts#L132)

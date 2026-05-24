[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentExecution

# Interface: AgentExecution

Defined in: [src/types/agent.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L11)

Agent execution record - tracks individual agent runs

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-3.md)

Defined in: [src/types/agent.ts:14](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L14)

***

### completedAt?

> `optional` **completedAt?**: `Date`

Defined in: [src/types/agent.ts:18](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L18)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/types/agent.ts:27](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L27)

***

### durationMs?

> `optional` **durationMs?**: `number`

Defined in: [src/types/agent.ts:20](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L20)

***

### errorMessage?

> `optional` **errorMessage?**: `string`

Defined in: [src/types/agent.ts:24](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L24)

***

### id

> **id**: `string`

Defined in: [src/types/agent.ts:12](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L12)

***

### output?

> `optional` **output?**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:23](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L23)

***

### progress

> **progress**: `number`

Defined in: [src/types/agent.ts:22](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L22)

***

### startedAt?

> `optional` **startedAt?**: `Date`

Defined in: [src/types/agent.ts:17](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L17)

***

### status

> **status**: `"running"` \| `"completed"` \| `"failed"` \| `"queued"`

Defined in: [src/types/agent.ts:16](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L16)

***

### tokenCount?

> `optional` **tokenCount?**: `number`

Defined in: [src/types/agent.ts:19](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L19)

***

### toolCalls

> **toolCalls**: [`ToolCall`](ToolCall.md)[]

Defined in: [src/types/agent.ts:26](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L26)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [src/types/agent.ts:28](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L28)

***

### userId

> **userId**: `string`

Defined in: [src/types/agent.ts:13](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/types/agent.ts#L13)

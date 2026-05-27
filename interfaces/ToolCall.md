[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ToolCall

# Interface: ToolCall

Defined in: [src/types/agent.ts:47](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L47)

Tool invocation within an agent execution

## Properties

### completedAt?

> `optional` **completedAt?**: `Date`

Defined in: [src/types/agent.ts:58](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L58)

***

### duration?

> `optional` **duration?**: `number`

Defined in: [src/types/agent.ts:59](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L59)

***

### error?

> `optional` **error?**: `string`

Defined in: [src/types/agent.ts:55](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L55)

***

### executionId

> **executionId**: `string`

Defined in: [src/types/agent.ts:49](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L49)

***

### id

> **id**: `string`

Defined in: [src/types/agent.ts:48](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L48)

***

### input?

> `optional` **input?**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:53](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L53)

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:62](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L62)

***

### output?

> `optional` **output?**: `Record`\<`string`, `any`\>

Defined in: [src/types/agent.ts:54](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L54)

***

### startedAt

> **startedAt**: `Date`

Defined in: [src/types/agent.ts:57](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L57)

***

### status

> **status**: `"success"` \| `"running"` \| `"failed"` \| `"pending"`

Defined in: [src/types/agent.ts:52](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L52)

***

### tokens?

> `optional` **tokens?**: `number`

Defined in: [src/types/agent.ts:61](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L61)

***

### toolName

> **toolName**: `string`

Defined in: [src/types/agent.ts:50](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/types/agent.ts#L50)

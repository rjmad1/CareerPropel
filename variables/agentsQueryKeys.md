[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / agentsQueryKeys

# Variable: agentsQueryKeys

> `const` **agentsQueryKeys**: `object`

Defined in: [src/hooks/useAgents.ts:37](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/hooks/useAgents.ts#L37)

## Type Declaration

### all

> **all**: readonly \[`"agents"`\]

### execution

> **execution**: (`id`) => readonly \[`"agents"`, `"execution"`, `string`\]

#### Parameters

##### id

`string`

#### Returns

readonly \[`"agents"`, `"execution"`, `string`\]

### executionList

> **executionList**: (`params?`) => readonly \[`"agents"`, `"executions"`, \{ `page?`: `number`; `pageSize?`: `number`; `status?`: `string`; \} \| `undefined`\]

#### Parameters

##### params?

###### page?

`number`

###### pageSize?

`number`

###### status?

`string`

#### Returns

readonly \[`"agents"`, `"executions"`, \{ `page?`: `number`; `pageSize?`: `number`; `status?`: `string`; \} \| `undefined`\]

### executions

> **executions**: () => readonly \[`"agents"`, `"executions"`\]

#### Returns

readonly \[`"agents"`, `"executions"`\]

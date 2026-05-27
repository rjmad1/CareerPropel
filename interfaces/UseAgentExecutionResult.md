[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseAgentExecutionResult

# Interface: UseAgentExecutionResult

Defined in: [src/hooks/useAgentExecution.ts:13](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L13)

## Properties

### cancel

> **cancel**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentExecution.ts:35](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L35)

#### Returns

`Promise`\<`void`\>

***

### currentPage

> **currentPage**: `number`

Defined in: [src/hooks/useAgentExecution.ts:23](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L23)

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useAgentExecution.ts:18](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L18)

***

### execution

> **execution**: [`AgentExecution`](AgentExecution.md) \| `null`

Defined in: [src/hooks/useAgentExecution.ts:14](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L14)

***

### filterLevel

> **filterLevel**: `string` \| `null`

Defined in: [src/hooks/useAgentExecution.ts:29](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L29)

***

### goToPage

> **goToPage**: (`page`) => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentExecution.ts:26](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L26)

#### Parameters

##### page

`number`

#### Returns

`Promise`\<`void`\>

***

### isCancelLoading

> **isCancelLoading**: `boolean`

Defined in: [src/hooks/useAgentExecution.ts:41](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L41)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/useAgentExecution.ts:19](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L19)

***

### isPauseLoading

> **isPauseLoading**: `boolean`

Defined in: [src/hooks/useAgentExecution.ts:39](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L39)

***

### isResumeLoading

> **isResumeLoading**: `boolean`

Defined in: [src/hooks/useAgentExecution.ts:40](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L40)

***

### isRunning

> **isRunning**: `boolean`

Defined in: [src/hooks/useAgentExecution.ts:20](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L20)

***

### logs

> **logs**: [`EventLog`](EventLog.md)[]

Defined in: [src/hooks/useAgentExecution.ts:16](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L16)

***

### logsPerPage

> **logsPerPage**: `number`

Defined in: [src/hooks/useAgentExecution.ts:25](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L25)

***

### pause

> **pause**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentExecution.ts:33](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L33)

#### Returns

`Promise`\<`void`\>

***

### refresh

> **refresh**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentExecution.ts:36](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L36)

#### Returns

`Promise`\<`void`\>

***

### resume

> **resume**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentExecution.ts:34](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L34)

#### Returns

`Promise`\<`void`\>

***

### setFilterLevel

> **setFilterLevel**: (`level`) => `void`

Defined in: [src/hooks/useAgentExecution.ts:30](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L30)

#### Parameters

##### level

`string` \| `null`

#### Returns

`void`

***

### status

> **status**: `"error"` \| `"loading"` \| `"ready"` \| `"idle"`

Defined in: [src/hooks/useAgentExecution.ts:17](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L17)

***

### toolCalls

> **toolCalls**: [`ToolCall`](ToolCall.md)[]

Defined in: [src/hooks/useAgentExecution.ts:15](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L15)

***

### totalLogs

> **totalLogs**: `number`

Defined in: [src/hooks/useAgentExecution.ts:24](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentExecution.ts#L24)

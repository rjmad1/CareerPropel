[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / appendExecutionLog

# Function: appendExecutionLog()

> **appendExecutionLog**(`executionId`, `userId`, `agentType`, `level`, `message`, `metadata?`): `Promise`\<\{ `executionId`: `string`; `id`: `string`; `level`: `string`; `message`: `string`; `metadata`: `JsonValue`; `timestamp`: `Date`; \}\>

Defined in: [src/lib/agents/store.ts:5](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/agents/store.ts#L5)

## Parameters

### executionId

`string`

### userId

`string`

### agentType

`string`

### level

`"INFO"` \| `"WARN"` \| `"ERROR"` \| `"DEBUG"`

### message

`string`

### metadata?

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<\{ `executionId`: `string`; `id`: `string`; `level`: `string`; `message`: `string`; `metadata`: `JsonValue`; `timestamp`: `Date`; \}\>

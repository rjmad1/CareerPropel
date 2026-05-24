[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentLogEvent

# Interface: AgentLogEvent

Defined in: [src/lib/websocket/broadcast.ts:21](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/broadcast.ts#L21)

## Properties

### data

> **data**: `object`

Defined in: [src/lib/websocket/broadcast.ts:23](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/broadcast.ts#L23)

#### executionId

> **executionId**: `string`

#### level

> **level**: `"INFO"` \| `"WARN"` \| `"ERROR"`

#### message

> **message**: `string`

#### metadata?

> `optional` **metadata?**: `Record`\<`string`, `any`\>

#### timestamp

> **timestamp**: `string`

***

### type

> **type**: `"agent:log"`

Defined in: [src/lib/websocket/broadcast.ts:22](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/broadcast.ts#L22)

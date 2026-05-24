[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / RealtimeJobUpdate

# Interface: RealtimeJobUpdate

Defined in: [src/lib/websocket/types.ts:33](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L33)

## Properties

### agentId?

> `optional` **agentId?**: `string`

Defined in: [src/lib/websocket/types.ts:41](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L41)

***

### changes?

> `optional` **changes?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/websocket/types.ts:38](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L38)

***

### changeType

> **changeType**: `"stage_change"` \| `"resume_updated"` \| `"match_score_updated"` \| `"status_changed"`

Defined in: [src/lib/websocket/types.ts:37](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L37)

***

### jobId

> **jobId**: `string`

Defined in: [src/lib/websocket/types.ts:34](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L34)

***

### newValue?

> `optional` **newValue?**: `unknown`

Defined in: [src/lib/websocket/types.ts:40](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L40)

***

### oldValue?

> `optional` **oldValue?**: `unknown`

Defined in: [src/lib/websocket/types.ts:39](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L39)

***

### stage

> **stage**: `string`

Defined in: [src/lib/websocket/types.ts:35](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L35)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/websocket/types.ts:36](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/types.ts#L36)

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStatusEvent

# Interface: AgentStatusEvent

Defined in: [src/lib/websocket/broadcast.ts:10](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/broadcast.ts#L10)

## Properties

### data

> **data**: `object`

Defined in: [src/lib/websocket/broadcast.ts:12](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/broadcast.ts#L12)

#### currentTask

> **currentTask**: `string`

#### errorMessage?

> `optional` **errorMessage?**: `string`

#### id

> **id**: `string`

#### progress

> **progress**: `number`

#### status

> **status**: `"running"` \| `"completed"` \| `"failed"` \| `"paused"`

***

### type

> **type**: `"agent:status"`

Defined in: [src/lib/websocket/broadcast.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/broadcast.ts#L11)

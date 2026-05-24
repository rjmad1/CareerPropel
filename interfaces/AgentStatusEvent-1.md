[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStatusEvent

# Interface: AgentStatusEvent

Defined in: [src/lib/websocket/broadcast.ts:10](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/websocket/broadcast.ts#L10)

## Properties

### data

> **data**: `object`

Defined in: [src/lib/websocket/broadcast.ts:12](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/websocket/broadcast.ts#L12)

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

Defined in: [src/lib/websocket/broadcast.ts:11](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/websocket/broadcast.ts#L11)

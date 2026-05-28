[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DynamicDagNode

# Interface: DynamicDagNode

Defined in: [src/lib/orchestration/types.ts:8](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L8)

## Properties

### agentType?

> `optional` **agentType?**: `string`

Defined in: [src/lib/orchestration/types.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L12)

***

### approvalActionType?

> `optional` **approvalActionType?**: `string`

Defined in: [src/lib/orchestration/types.ts:15](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L15)

***

### approvalRationale?

> `optional` **approvalRationale?**: `string`

Defined in: [src/lib/orchestration/types.ts:16](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L16)

***

### conditionField?

> `optional` **conditionField?**: `string`

Defined in: [src/lib/orchestration/types.ts:17](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L17)

***

### delayMs?

> `optional` **delayMs?**: `number`

Defined in: [src/lib/orchestration/types.ts:21](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L21)

***

### dependencies

> **dependencies**: `string`[]

Defined in: [src/lib/orchestration/types.ts:13](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L13)

***

### falseBranch?

> `optional` **falseBranch?**: `string`

Defined in: [src/lib/orchestration/types.ts:19](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L19)

***

### inputTemplate?

> `optional` **inputTemplate?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/orchestration/types.ts:14](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L14)

***

### key

> **key**: `string`

Defined in: [src/lib/orchestration/types.ts:9](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L9)

***

### name

> **name**: `string`

Defined in: [src/lib/orchestration/types.ts:10](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L10)

***

### notificationMessage?

> `optional` **notificationMessage?**: `string`

Defined in: [src/lib/orchestration/types.ts:20](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L20)

***

### optional?

> `optional` **optional?**: `boolean`

Defined in: [src/lib/orchestration/types.ts:22](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L22)

***

### trueBranch?

> `optional` **trueBranch?**: `string`

Defined in: [src/lib/orchestration/types.ts:18](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L18)

***

### type

> **type**: `"notification"` \| `"delay"` \| `"agent_call"` \| `"approval"` \| `"condition"`

Defined in: [src/lib/orchestration/types.ts:11](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/types.ts#L11)

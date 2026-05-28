[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStep

# Interface: AgentStep

Defined in: [src/lib/governance/multiAgentCoordination.ts:25](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L25)

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType.md)

Defined in: [src/lib/governance/multiAgentCoordination.ts:27](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L27)

***

### canParallelize

> **canParallelize**: `boolean`

Defined in: [src/lib/governance/multiAgentCoordination.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L31)

Whether this step can run in parallel with adjacent steps

***

### inputMapping

> **inputMapping**: `Record`\<`string`, `string`\>

Defined in: [src/lib/governance/multiAgentCoordination.ts:29](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L29)

Input keys to pass from parent context or prior step outputs

***

### stepId

> **stepId**: `string`

Defined in: [src/lib/governance/multiAgentCoordination.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L26)

***

### tokenBudget

> **tokenBudget**: `number`

Defined in: [src/lib/governance/multiAgentCoordination.ts:33](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L33)

Max tokens allocated to this step

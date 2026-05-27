[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isCanaryRoute

# Function: isCanaryRoute()

> **isCanaryRoute**(`userId`, `agentType`, `canaryPercent`): `boolean`

Defined in: [src/lib/governance/multiAgentCoordination.ts:181](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/governance/multiAgentCoordination.ts#L181)

Determines whether a given execution should be routed to the canary prompt.
Uses a deterministic hash of userId + agentType so the same user gets consistent routing.

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType.md)

### canaryPercent

`number`

## Returns

`boolean`

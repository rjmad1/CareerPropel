[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isCanaryRoute

# Function: isCanaryRoute()

> **isCanaryRoute**(`userId`, `agentType`, `canaryPercent`): `boolean`

Defined in: [src/lib/governance/multiAgentCoordination.ts:181](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/multiAgentCoordination.ts#L181)

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

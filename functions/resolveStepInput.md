[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveStepInput

# Function: resolveStepInput()

> **resolveStepInput**(`step`, `initialContext`, `completedSteps`): `Record`\<`string`, `string`\>

Defined in: [src/lib/governance/multiAgentCoordination.ts:139](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/multiAgentCoordination.ts#L139)

Resolve input for a step from orchestration context + completed step outputs.

## Parameters

### step

[`AgentStep`](../interfaces/AgentStep.md)

### initialContext

`Record`\<`string`, `string`\>

### completedSteps

`Map`\<`string`, `Record`\<`string`, `unknown`\>\>

## Returns

`Record`\<`string`, `string`\>

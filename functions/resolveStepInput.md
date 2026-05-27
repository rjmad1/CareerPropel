[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveStepInput

# Function: resolveStepInput()

> **resolveStepInput**(`step`, `initialContext`, `completedSteps`): `Record`\<`string`, `string`\>

Defined in: [src/lib/governance/multiAgentCoordination.ts:139](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/governance/multiAgentCoordination.ts#L139)

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

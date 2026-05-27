[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isolateStepContext

# Function: isolateStepContext()

> **isolateStepContext**(`orchestrationCtx`, `step`, `stepExecutionId`): [`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

Defined in: [src/lib/governance/multiAgentCoordination.ts:121](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/multiAgentCoordination.ts#L121)

Prepare isolated context for a single step within an orchestration.

## Parameters

### orchestrationCtx

[`OrchestrationContext`](../interfaces/OrchestrationContext.md)

### step

[`AgentStep`](../interfaces/AgentStep.md)

### stepExecutionId

`string`

## Returns

[`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

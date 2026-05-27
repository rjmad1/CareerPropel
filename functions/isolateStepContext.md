[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isolateStepContext

# Function: isolateStepContext()

> **isolateStepContext**(`orchestrationCtx`, `step`, `stepExecutionId`): [`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

Defined in: [src/lib/governance/multiAgentCoordination.ts:121](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/governance/multiAgentCoordination.ts#L121)

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

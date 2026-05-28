[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isolateStepContext

# Function: isolateStepContext()

> **isolateStepContext**(`orchestrationCtx`, `step`, `stepExecutionId`): [`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

Defined in: [src/lib/governance/multiAgentCoordination.ts:121](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/multiAgentCoordination.ts#L121)

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

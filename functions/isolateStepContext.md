[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isolateStepContext

# Function: isolateStepContext()

> **isolateStepContext**(`orchestrationCtx`, `step`, `stepExecutionId`): [`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

Defined in: [src/lib/governance/multiAgentCoordination.ts:121](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/governance/multiAgentCoordination.ts#L121)

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

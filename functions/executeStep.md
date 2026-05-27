[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / executeStep

# Function: executeStep()

> **executeStep**(`step`, `wfContext`, `workflowId`): `Promise`\<[`StepResult`](../interfaces/StepResult.md)\>

Defined in: [src/lib/workflow/step-executor.ts:204](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/step-executor.ts#L204)

Execute a single workflow step. Returns a StepResult.

## Parameters

### step

[`WorkflowStepDefinition`](../interfaces/WorkflowStepDefinition.md)

### wfContext

[`WorkflowContext`](../interfaces/WorkflowContext.md)

### workflowId

`string`

## Returns

`Promise`\<[`StepResult`](../interfaces/StepResult.md)\>

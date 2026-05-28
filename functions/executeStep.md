[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / executeStep

# Function: executeStep()

> **executeStep**(`step`, `wfContext`, `workflowId`): `Promise`\<[`StepResult`](../interfaces/StepResult.md)\>

Defined in: [src/lib/workflow/step-executor.ts:204](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/step-executor.ts#L204)

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

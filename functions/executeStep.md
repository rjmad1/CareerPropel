[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / executeStep

# Function: executeStep()

> **executeStep**(`step`, `wfContext`, `workflowId`): `Promise`\<[`StepResult`](../interfaces/StepResult.md)\>

Defined in: [src/lib/workflow/step-executor.ts:204](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/workflow/step-executor.ts#L204)

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

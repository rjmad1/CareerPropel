[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / advanceWorkflow

# Function: advanceWorkflow()

> **advanceWorkflow**(`workflowExecutionId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:133](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/workflow/engine.ts#L133)

Advance a workflow by processing the current step.
Called by the BullMQ worker for each step.

## Parameters

### workflowExecutionId

`string`

## Returns

`Promise`\<`void`\>

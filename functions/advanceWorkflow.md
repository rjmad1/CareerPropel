[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / advanceWorkflow

# Function: advanceWorkflow()

> **advanceWorkflow**(`workflowExecutionId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:133](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/engine.ts#L133)

Advance a workflow by processing the current step.
Called by the BullMQ worker for each step.

## Parameters

### workflowExecutionId

`string`

## Returns

`Promise`\<`void`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / advanceWorkflow

# Function: advanceWorkflow()

> **advanceWorkflow**(`workflowExecutionId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:133](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/engine.ts#L133)

Advance a workflow by processing the current step.
Called by the BullMQ worker for each step.

## Parameters

### workflowExecutionId

`string`

## Returns

`Promise`\<`void`\>

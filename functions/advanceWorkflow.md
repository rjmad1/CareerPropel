[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / advanceWorkflow

# Function: advanceWorkflow()

> **advanceWorkflow**(`workflowExecutionId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:133](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/workflow/engine.ts#L133)

Advance a workflow by processing the current step.
Called by the BullMQ worker for each step.

## Parameters

### workflowExecutionId

`string`

## Returns

`Promise`\<`void`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / recoverWorkflow

# Function: recoverWorkflow()

> **recoverWorkflow**(`workflowId`, `candidateId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:606](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/engine.ts#L606)

Recover a failed workflow by re-queuing it from the current step.
This is the only sanctioned way to leave the 'failed' state (the 'recover' transition).

## Parameters

### workflowId

`string`

### candidateId

`string`

## Returns

`Promise`\<`void`\>

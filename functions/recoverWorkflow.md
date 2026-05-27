[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / recoverWorkflow

# Function: recoverWorkflow()

> **recoverWorkflow**(`workflowId`, `candidateId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:606](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/engine.ts#L606)

Recover a failed workflow by re-queuing it from the current step.
This is the only sanctioned way to leave the 'failed' state (the 'recover' transition).

## Parameters

### workflowId

`string`

### candidateId

`string`

## Returns

`Promise`\<`void`\>

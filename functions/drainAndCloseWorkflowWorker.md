[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseWorkflowWorker

# Function: drainAndCloseWorkflowWorker()

> **drainAndCloseWorkflowWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/worker.ts:56](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/workflow/worker.ts#L56)

Gracefully drain and close the workflow worker.
Polls the actual active-job count so the process waits for in-flight steps to finish.
Exported so bin/worker.ts can coordinate shutdown alongside the agent worker.

## Parameters

### worker

`Worker`\<[`WorkflowJobData`](../interfaces/WorkflowJobData.md)\>

### workerId

`string`

## Returns

`Promise`\<`void`\>

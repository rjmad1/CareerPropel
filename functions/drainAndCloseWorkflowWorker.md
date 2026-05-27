[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseWorkflowWorker

# Function: drainAndCloseWorkflowWorker()

> **drainAndCloseWorkflowWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/worker.ts:56](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/worker.ts#L56)

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

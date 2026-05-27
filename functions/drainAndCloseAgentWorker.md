[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseAgentWorker

# Function: drainAndCloseAgentWorker()

> **drainAndCloseAgentWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/queue/worker.ts:358](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/worker.ts#L358)

Gracefully drain and close the agent worker.
Poll actual active-job count; wait up to DRAIN_TIMEOUT_MS before forcing close.

## Parameters

### worker

`Worker`\<[`AgentJobData`](../interfaces/AgentJobData.md)\>

### workerId

`string`

## Returns

`Promise`\<`void`\>

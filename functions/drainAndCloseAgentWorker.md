[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseAgentWorker

# Function: drainAndCloseAgentWorker()

> **drainAndCloseAgentWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/queue/worker.ts:358](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/queue/worker.ts#L358)

Gracefully drain and close the agent worker.
Poll actual active-job count; wait up to DRAIN_TIMEOUT_MS before forcing close.

## Parameters

### worker

`Worker`\<[`AgentJobData`](../interfaces/AgentJobData.md)\>

### workerId

`string`

## Returns

`Promise`\<`void`\>

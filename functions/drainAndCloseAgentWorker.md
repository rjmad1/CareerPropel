[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseAgentWorker

# Function: drainAndCloseAgentWorker()

> **drainAndCloseAgentWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/queue/worker.ts:358](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/queue/worker.ts#L358)

Gracefully drain and close the agent worker.
Poll actual active-job count; wait up to DRAIN_TIMEOUT_MS before forcing close.

## Parameters

### worker

`Worker`\<[`AgentJobData`](../interfaces/AgentJobData.md)\>

### workerId

`string`

## Returns

`Promise`\<`void`\>

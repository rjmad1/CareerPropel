[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / drainAndCloseAgentWorker

# Function: drainAndCloseAgentWorker()

> **drainAndCloseAgentWorker**(`worker`, `workerId`): `Promise`\<`void`\>

Defined in: [src/lib/queue/worker.ts:358](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/queue/worker.ts#L358)

Gracefully drain and close the agent worker.
Poll actual active-job count; wait up to DRAIN_TIMEOUT_MS before forcing close.

## Parameters

### worker

`Worker`\<[`AgentJobData`](../interfaces/AgentJobData.md)\>

### workerId

`string`

## Returns

`Promise`\<`void`\>

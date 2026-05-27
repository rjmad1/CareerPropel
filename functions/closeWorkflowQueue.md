[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / closeWorkflowQueue

# Function: closeWorkflowQueue()

> **closeWorkflowQueue**(): `Promise`\<`void`\>

Defined in: [src/lib/workflow/queue.ts:30](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/queue.ts#L30)

Gracefully close the singleton Queue and release its Redis connection.
Idempotent — safe to call multiple times during shutdown.

## Returns

`Promise`\<`void`\>

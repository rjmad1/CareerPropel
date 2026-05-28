[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / closeWorkflowQueue

# Function: closeWorkflowQueue()

> **closeWorkflowQueue**(): `Promise`\<`void`\>

Defined in: [src/lib/workflow/queue.ts:30](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/queue.ts#L30)

Gracefully close the singleton Queue and release its Redis connection.
Idempotent — safe to call multiple times during shutdown.

## Returns

`Promise`\<`void`\>

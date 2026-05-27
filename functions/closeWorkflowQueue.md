[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / closeWorkflowQueue

# Function: closeWorkflowQueue()

> **closeWorkflowQueue**(): `Promise`\<`void`\>

Defined in: [src/lib/workflow/queue.ts:30](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/workflow/queue.ts#L30)

Gracefully close the singleton Queue and release its Redis connection.
Idempotent — safe to call multiple times during shutdown.

## Returns

`Promise`\<`void`\>

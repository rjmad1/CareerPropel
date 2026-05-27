[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / closeWorkflowQueue

# Function: closeWorkflowQueue()

> **closeWorkflowQueue**(): `Promise`\<`void`\>

Defined in: [src/lib/workflow/queue.ts:30](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/workflow/queue.ts#L30)

Gracefully close the singleton Queue and release its Redis connection.
Idempotent — safe to call multiple times during shutdown.

## Returns

`Promise`\<`void`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createApprovalRequest

# Function: createApprovalRequest()

> **createApprovalRequest**(`params`): `Promise`\<`string`\>

Defined in: [src/lib/workflow/approval-manager.ts:20](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/approval-manager.ts#L20)

Create a new approval request and notify the user via Redis pub/sub.

## Parameters

### params

[`CreateApprovalParams`](../interfaces/CreateApprovalParams.md)

## Returns

`Promise`\<`string`\>

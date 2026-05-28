[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createApprovalRequest

# Function: createApprovalRequest()

> **createApprovalRequest**(`params`): `Promise`\<`string`\>

Defined in: [src/lib/workflow/approval-manager.ts:20](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/approval-manager.ts#L20)

Create a new approval request and notify the user via Redis pub/sub.

## Parameters

### params

[`CreateApprovalParams`](../interfaces/CreateApprovalParams.md)

## Returns

`Promise`\<`string`\>

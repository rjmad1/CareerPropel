[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createApprovalRequest

# Function: createApprovalRequest()

> **createApprovalRequest**(`params`): `Promise`\<`string`\>

Defined in: [src/lib/workflow/approval-manager.ts:20](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/approval-manager.ts#L20)

Create a new approval request and notify the user via Redis pub/sub.

## Parameters

### params

[`CreateApprovalParams`](../interfaces/CreateApprovalParams.md)

## Returns

`Promise`\<`string`\>

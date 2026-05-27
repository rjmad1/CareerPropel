[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createApprovalRequest

# Function: createApprovalRequest()

> **createApprovalRequest**(`params`): `Promise`\<`string`\>

Defined in: [src/lib/workflow/approval-manager.ts:20](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/workflow/approval-manager.ts#L20)

Create a new approval request and notify the user via Redis pub/sub.

## Parameters

### params

[`CreateApprovalParams`](../interfaces/CreateApprovalParams.md)

## Returns

`Promise`\<`string`\>

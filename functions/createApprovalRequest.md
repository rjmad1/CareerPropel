[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createApprovalRequest

# Function: createApprovalRequest()

> **createApprovalRequest**(`params`): `Promise`\<`string`\>

Defined in: [src/lib/workflow/approval-manager.ts:20](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/workflow/approval-manager.ts#L20)

Create a new approval request and notify the user via Redis pub/sub.

## Parameters

### params

[`CreateApprovalParams`](../interfaces/CreateApprovalParams.md)

## Returns

`Promise`\<`string`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / recordApprovalDecision

# Function: recordApprovalDecision()

> **recordApprovalDecision**(`approvalId`, `candidateId`, `decision`, `note?`, `modifiedPayload?`): `Promise`\<\{ `actionType`: `ApprovalActionType`; `candidateId`: `string`; `createdAt`: `Date`; `decidedAt`: `Date` \| `null`; `decision`: `ApprovalDecision` \| `null`; `decisionNote`: `string` \| `null`; `expiresAt`: `Date` \| `null`; `id`: `string`; `modifiedPayload`: `JsonValue`; `payload`: `JsonValue`; `stepKey`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>

Defined in: [src/lib/workflow/approval-manager.ts:84](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/workflow/approval-manager.ts#L84)

Record a decision on an approval request.
Returns the updated approval record.

## Parameters

### approvalId

`string`

### candidateId

`string`

### decision

[`ApprovalDecision`](../type-aliases/ApprovalDecision.md)

### note?

`string`

### modifiedPayload?

[`ApprovalPayload`](../interfaces/ApprovalPayload.md)

## Returns

`Promise`\<\{ `actionType`: `ApprovalActionType`; `candidateId`: `string`; `createdAt`: `Date`; `decidedAt`: `Date` \| `null`; `decision`: `ApprovalDecision` \| `null`; `decisionNote`: `string` \| `null`; `expiresAt`: `Date` \| `null`; `id`: `string`; `modifiedPayload`: `JsonValue`; `payload`: `JsonValue`; `stepKey`: `string`; `updatedAt`: `Date`; `workflowId`: `string`; \}\>

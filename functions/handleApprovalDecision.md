[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / handleApprovalDecision

# Function: handleApprovalDecision()

> **handleApprovalDecision**(`approvalId`, `candidateId`, `decision`, `note?`, `modifiedPayload?`): `Promise`\<`void`\>

Defined in: [src/lib/workflow/engine.ts:525](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/engine.ts#L525)

Handle an approval decision. If approved, resume the workflow from the approval step.

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

`Promise`\<`void`\>

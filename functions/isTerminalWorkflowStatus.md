[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isTerminalWorkflowStatus

# Function: isTerminalWorkflowStatus()

> **isTerminalWorkflowStatus**(`status`): `boolean`

Defined in: [src/lib/workflow/state-machine.ts:66](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/state-machine.ts#L66)

Returns true for statuses that the automatic advance loop should never re-enter.
NOTE: 'failed' is intentionally excluded here so that:
  - cancelWorkflow can still cancel a failed workflow (valid transition in WORKFLOW_TRANSITIONS)
  - recoverWorkflow can re-queue a failed workflow for retry
Use isIrrecoverableWorkflowStatus() when you want to include failed in the check.

## Parameters

### status

[`WorkflowStatus`](../type-aliases/WorkflowStatus.md)

## Returns

`boolean`

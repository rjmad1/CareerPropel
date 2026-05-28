[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isIrrecoverableWorkflowStatus

# Function: isIrrecoverableWorkflowStatus()

> **isIrrecoverableWorkflowStatus**(`status`): `boolean`

Defined in: [src/lib/workflow/state-machine.ts:73](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/workflow/state-machine.ts#L73)

Returns true for statuses that cannot transition further under any circumstances.

## Parameters

### status

[`WorkflowStatus`](../type-aliases/WorkflowStatus.md)

## Returns

`boolean`

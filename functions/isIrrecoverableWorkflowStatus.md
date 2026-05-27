[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isIrrecoverableWorkflowStatus

# Function: isIrrecoverableWorkflowStatus()

> **isIrrecoverableWorkflowStatus**(`status`): `boolean`

Defined in: [src/lib/workflow/state-machine.ts:73](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/state-machine.ts#L73)

Returns true for statuses that cannot transition further under any circumstances.

## Parameters

### status

[`WorkflowStatus`](../type-aliases/WorkflowStatus.md)

## Returns

`boolean`

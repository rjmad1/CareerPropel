[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / isIrrecoverableWorkflowStatus

# Function: isIrrecoverableWorkflowStatus()

> **isIrrecoverableWorkflowStatus**(`status`): `boolean`

Defined in: [src/lib/workflow/state-machine.ts:73](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/workflow/state-machine.ts#L73)

Returns true for statuses that cannot transition further under any circumstances.

## Parameters

### status

[`WorkflowStatus`](../type-aliases/WorkflowStatus.md)

## Returns

`boolean`

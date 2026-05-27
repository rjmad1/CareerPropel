[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / emitNavigationEvent

# Function: emitNavigationEvent()

> **emitNavigationEvent**(`type`, `data?`): `void`

Defined in: [src/lib/navigation/analytics.ts:61](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L61)

Emit a navigation event to all registered handlers + structured log.

## Parameters

### type

[`NavigationEventType`](../type-aliases/NavigationEventType.md)

### data?

`Omit`\<[`NavigationEvent`](../interfaces/NavigationEvent.md), `"type"` \| `"timestamp"`\> = `{}`

## Returns

`void`

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / emitNavigationEvent

# Function: emitNavigationEvent()

> **emitNavigationEvent**(`type`, `data?`): `void`

Defined in: [src/lib/navigation/analytics.ts:61](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/analytics.ts#L61)

Emit a navigation event to all registered handlers + structured log.

## Parameters

### type

[`NavigationEventType`](../type-aliases/NavigationEventType.md)

### data?

`Omit`\<[`NavigationEvent`](../interfaces/NavigationEvent.md), `"type"` \| `"timestamp"`\> = `{}`

## Returns

`void`

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / emitNavigationEvent

# Function: emitNavigationEvent()

> **emitNavigationEvent**(`type`, `data?`): `void`

Defined in: [src/lib/navigation/analytics.ts:61](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/navigation/analytics.ts#L61)

Emit a navigation event to all registered handlers + structured log.

## Parameters

### type

[`NavigationEventType`](../type-aliases/NavigationEventType.md)

### data?

`Omit`\<[`NavigationEvent`](../interfaces/NavigationEvent.md), `"type"` \| `"timestamp"`\> = `{}`

## Returns

`void`

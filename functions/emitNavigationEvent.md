[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / emitNavigationEvent

# Function: emitNavigationEvent()

> **emitNavigationEvent**(`type`, `data?`): `void`

Defined in: [src/lib/navigation/analytics.ts:61](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/analytics.ts#L61)

Emit a navigation event to all registered handlers + structured log.

## Parameters

### type

[`NavigationEventType`](../type-aliases/NavigationEventType.md)

### data?

`Omit`\<[`NavigationEvent`](../interfaces/NavigationEvent.md), `"type"` \| `"timestamp"`\> = `{}`

## Returns

`void`

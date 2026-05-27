[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / emitNavigationEvent

# Function: emitNavigationEvent()

> **emitNavigationEvent**(`type`, `data?`): `void`

Defined in: [src/lib/navigation/analytics.ts:61](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/navigation/analytics.ts#L61)

Emit a navigation event to all registered handlers + structured log.

## Parameters

### type

[`NavigationEventType`](../type-aliases/NavigationEventType.md)

### data?

`Omit`\<[`NavigationEvent`](../interfaces/NavigationEvent.md), `"type"` \| `"timestamp"`\> = `{}`

## Returns

`void`

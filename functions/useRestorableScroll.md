[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRestorableScroll

# Function: useRestorableScroll()

> **useRestorableScroll**(`options?`): `object`

Defined in: [src/hooks/useRestorableScroll.ts:34](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useRestorableScroll.ts#L34)

## Parameters

### options?

`UseRestorableScrollOptions` = `{}`

## Returns

### getSavedPayload

> **getSavedPayload**: () => `Record`\<`string`, `unknown`\> \| `undefined`

Read saved payload without restoring scroll.

#### Returns

`Record`\<`string`, `unknown`\> \| `undefined`

### saveScroll

> **saveScroll**: (`overridePayload?`) => `void`

Manually save current scroll + payload before navigating away.

#### Parameters

##### overridePayload?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

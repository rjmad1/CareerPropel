[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRestorableScroll

# Function: useRestorableScroll()

> **useRestorableScroll**(`options?`): `object`

Defined in: [src/hooks/useRestorableScroll.ts:34](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useRestorableScroll.ts#L34)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRestorableScroll

# Function: useRestorableScroll()

> **useRestorableScroll**(`options?`): `object`

Defined in: [src/hooks/useRestorableScroll.ts:34](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useRestorableScroll.ts#L34)

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

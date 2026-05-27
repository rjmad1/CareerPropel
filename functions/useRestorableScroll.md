[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRestorableScroll

# Function: useRestorableScroll()

> **useRestorableScroll**(`options?`): `object`

Defined in: [src/hooks/useRestorableScroll.ts:34](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useRestorableScroll.ts#L34)

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

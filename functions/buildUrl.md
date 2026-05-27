[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildUrl

# Function: buildUrl()

> **buildUrl**(`pathname`, `params?`, `baseParams?`): `string`

Defined in: [src/lib/navigation/state.ts:56](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/navigation/state.ts#L56)

Build a URL with typed params merged on top of an optional base.
Null / undefined values are dropped.

## Parameters

### pathname

`string`

### params?

[`ParamRecord`](../type-aliases/ParamRecord.md) = `{}`

### baseParams?

`URLSearchParams` \| `ReadonlyURLSearchParams`

## Returns

`string`

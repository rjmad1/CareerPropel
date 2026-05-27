[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildUrl

# Function: buildUrl()

> **buildUrl**(`pathname`, `params?`, `baseParams?`): `string`

Defined in: [src/lib/navigation/state.ts:56](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/navigation/state.ts#L56)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildUrl

# Function: buildUrl()

> **buildUrl**(`pathname`, `params?`, `baseParams?`): `string`

Defined in: [src/lib/navigation/state.ts:56](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/state.ts#L56)

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

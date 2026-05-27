[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildUrl

# Function: buildUrl()

> **buildUrl**(`pathname`, `params?`, `baseParams?`): `string`

Defined in: [src/lib/navigation/state.ts:56](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/state.ts#L56)

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

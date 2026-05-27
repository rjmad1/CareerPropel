[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildShareableUrl

# Function: buildShareableUrl()

> **buildShareableUrl**(`baseUrl`, `pathname`, `params`): `string`

Defined in: [src/lib/navigation/deep-link.ts:84](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/navigation/deep-link.ts#L84)

Build a shareable deep-link URL for the current route + params.
Strips transient/non-essential params that should not be shared.

## Parameters

### baseUrl

`string`

### pathname

`string`

### params

`URLSearchParams`

## Returns

`string`

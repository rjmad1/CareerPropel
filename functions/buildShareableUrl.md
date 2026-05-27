[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildShareableUrl

# Function: buildShareableUrl()

> **buildShareableUrl**(`baseUrl`, `pathname`, `params`): `string`

Defined in: [src/lib/navigation/deep-link.ts:84](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/navigation/deep-link.ts#L84)

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

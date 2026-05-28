[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildShareableUrl

# Function: buildShareableUrl()

> **buildShareableUrl**(`baseUrl`, `pathname`, `params`): `string`

Defined in: [src/lib/navigation/deep-link.ts:84](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/deep-link.ts#L84)

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

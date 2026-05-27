[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildShareableUrl

# Function: buildShareableUrl()

> **buildShareableUrl**(`baseUrl`, `pathname`, `params`): `string`

Defined in: [src/lib/navigation/deep-link.ts:84](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/deep-link.ts#L84)

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

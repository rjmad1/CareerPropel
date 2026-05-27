[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveRouteKey

# Function: resolveRouteKey()

> **resolveRouteKey**(`pathname`): `string`

Defined in: [src/lib/navigation/routes.ts:103](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/routes.ts#L103)

Resolve the closest static route key for a given pathname.
Dynamic segments (e.g. /jobs/abc123) are normalised to their parent.

## Parameters

### pathname

`string`

## Returns

`string`

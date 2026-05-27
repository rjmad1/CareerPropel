[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveRouteKey

# Function: resolveRouteKey()

> **resolveRouteKey**(`pathname`): `string`

Defined in: [src/lib/navigation/routes.ts:103](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/navigation/routes.ts#L103)

Resolve the closest static route key for a given pathname.
Dynamic segments (e.g. /jobs/abc123) are normalised to their parent.

## Parameters

### pathname

`string`

## Returns

`string`

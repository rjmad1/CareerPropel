[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveRouteKey

# Function: resolveRouteKey()

> **resolveRouteKey**(`pathname`): `string`

Defined in: [src/lib/navigation/routes.ts:103](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/navigation/routes.ts#L103)

Resolve the closest static route key for a given pathname.
Dynamic segments (e.g. /jobs/abc123) are normalised to their parent.

## Parameters

### pathname

`string`

## Returns

`string`

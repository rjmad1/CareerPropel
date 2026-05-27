[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / resolveRouteKey

# Function: resolveRouteKey()

> **resolveRouteKey**(`pathname`): `string`

Defined in: [src/lib/navigation/routes.ts:103](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/navigation/routes.ts#L103)

Resolve the closest static route key for a given pathname.
Dynamic segments (e.g. /jobs/abc123) are normalised to their parent.

## Parameters

### pathname

`string`

## Returns

`string`

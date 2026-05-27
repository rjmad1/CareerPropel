[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / enforceRoutePolicy

# Function: enforceRoutePolicy()

> **enforceRoutePolicy**(`request`, `policy`, `userId?`, `userEmail?`): `Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

Defined in: [src/lib/middleware/routeGovernance.ts:41](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/middleware/routeGovernance.ts#L41)

Enforces a RoutePolicy on an incoming request.
Returns a NextResponse if the request is blocked, or null if it passes.

## Parameters

### request

`NextRequest`

### policy

[`RoutePolicy`](../interfaces/RoutePolicy.md)

### userId?

`string`

### userEmail?

`string`

## Returns

`Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / enforceRoutePolicy

# Function: enforceRoutePolicy()

> **enforceRoutePolicy**(`request`, `policy`, `userId?`, `userEmail?`): `Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

Defined in: [src/lib/middleware/routeGovernance.ts:41](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/middleware/routeGovernance.ts#L41)

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

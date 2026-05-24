[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / enforceRoutePolicy

# Function: enforceRoutePolicy()

> **enforceRoutePolicy**(`request`, `policy`, `userId?`, `userEmail?`): `Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

Defined in: [src/lib/middleware/routeGovernance.ts:41](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/middleware/routeGovernance.ts#L41)

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

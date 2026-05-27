[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `email`: `string`; `riskScore`: `number`; \}\>\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `summary`: \{ `criticalCount`: `number`; `highRiskCount`: `number`; `totalUsersScanned`: `number`; `usersWithAlerts`: `number`; \}; `users`: `object`[]; \}\>\>\>

Defined in: [src/app/api/admin/threats/route.ts:21](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/admin/threats/route.ts#L21)

GET /api/admin/threats
Get threat alerts and suspicious activity for users
Protected: Requires authentication + 'security.manage' permission

Query parameters:
- email: Filter by user email (optional, shows all if not specified but requires admin)
- minRiskScore: Only show users with risk score >= this value

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `email`: `string`; `riskScore`: `number`; \}\>\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `summary`: \{ `criticalCount`: `number`; `highRiskCount`: `number`; `totalUsersScanned`: `number`; `usersWithAlerts`: `number`; \}; `users`: `object`[]; \}\>\>\>

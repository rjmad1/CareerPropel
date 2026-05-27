[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `logs`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>\>\>

Defined in: [src/app/api/audit-logs/route.ts:21](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/audit-logs/route.ts#L21)

GET /api/audit-logs
Get audit logs for the authenticated user
Protected: Requires authentication

Query parameters:
- action: Filter by action type
- resource: Filter by resource
- severity: Filter by severity (info, warning, error, critical)
- limit: Number of logs to return (default: 50, max: 500)
- offset: Offset for pagination (default: 0)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `logs`: `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>\>\>

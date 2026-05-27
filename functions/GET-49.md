[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: \{ `breakdown`: [`HealthScoreBreakdown`](../interfaces/HealthScoreBreakdown.md); `daysSinceLastActivity`: `number`; `label`: `"active"` \| `"stale"` \| `"at_risk"` \| `"momentum"` \| `"hot"`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/health/route.ts:9](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/opportunities/[jobId]/health/route.ts#L9)

## Parameters

### \_req

`NextRequest`

### \_\_namedParameters

#### params

\{ `jobId`: `string`; \}

#### params.jobId

`string`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `breakdown`: [`HealthScoreBreakdown`](../interfaces/HealthScoreBreakdown.md); `daysSinceLastActivity`: `number`; `label`: `"active"` \| `"stale"` \| `"at_risk"` \| `"momentum"` \| `"hot"`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

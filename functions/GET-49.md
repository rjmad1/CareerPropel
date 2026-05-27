[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: \{ `breakdown`: [`HealthScoreBreakdown`](../interfaces/HealthScoreBreakdown.md); `daysSinceLastActivity`: `number`; `label`: `"active"` \| `"stale"` \| `"at_risk"` \| `"momentum"` \| `"hot"`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/health/route.ts:9](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/opportunities/[jobId]/health/route.ts#L9)

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

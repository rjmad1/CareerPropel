[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: [`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md); \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/plan/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/opportunities/[jobId]/plan/route.ts#L46)

## Parameters

### \_req

`NextRequest`

### \_\_namedParameters

#### params

\{ `jobId`: `string`; \}

#### params.jobId

`string`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: [`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md); \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

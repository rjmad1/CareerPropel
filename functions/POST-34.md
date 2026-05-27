[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: [`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md); \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/plan/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/opportunities/[jobId]/plan/route.ts#L46)

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

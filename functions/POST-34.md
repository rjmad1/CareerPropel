[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: [`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md); \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/plan/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/opportunities/[jobId]/plan/route.ts#L46)

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

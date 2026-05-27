[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: \{ `actions`: `JsonValue`; `candidateId`: `string`; `createdAt`: `Date`; `expiresAt`: `Date` \| `null`; `generatedAt`: `Date`; `healthBreakdown`: `JsonValue`; `id`: `string`; `jobId`: `string`; `momentumScore`: `number`; `readinessScore`: `number`; `suggestedWorkflow`: `string` \| `null`; `updatedAt`: `Date`; `urgencyScore`: `number`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/opportunities/\[jobId\]/plan/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/opportunities/[jobId]/plan/route.ts#L14)

## Parameters

### \_req

`NextRequest`

### \_\_namedParameters

#### params

\{ `jobId`: `string`; \}

#### params.jobId

`string`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `actions`: `JsonValue`; `candidateId`: `string`; `createdAt`: `Date`; `expiresAt`: `Date` \| `null`; `generatedAt`: `Date`; `healthBreakdown`: `JsonValue`; `id`: `string`; `jobId`: `string`; `momentumScore`: `number`; `readinessScore`: `number`; `suggestedWorkflow`: `string` \| `null`; `updatedAt`: `Date`; `urgencyScore`: `number`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

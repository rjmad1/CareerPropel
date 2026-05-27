[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `content`: `string`; `session`: \{ `candidateId`: `string`; `createdAt`: `Date`; `endDate`: `Date`; `id`: `string`; `impactDraft`: `string` \| `null`; `selfReview`: `string` \| `null`; `startDate`: `Date`; `status`: `string`; `title`: `string`; `updatedAt`: `Date`; \}; `success`: `boolean`; \}\>\>

Defined in: [src/app/api/profile/appraisal-compile/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/profile/appraisal-compile/route.ts#L44)

POST /api/profile/appraisal-compile
Takes a list of staged accomplishment IDs and compiles them into a comprehensive
performance appraisal self-evaluation or a promotion business case.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `content`: `string`; `session`: \{ `candidateId`: `string`; `createdAt`: `Date`; `endDate`: `Date`; `id`: `string`; `impactDraft`: `string` \| `null`; `selfReview`: `string` \| `null`; `startDate`: `Date`; `status`: `string`; `title`: `string`; `updatedAt`: `Date`; \}; `success`: `boolean`; \}\>\>

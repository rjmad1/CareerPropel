[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `null`; `avgDaysToApply`: `null`; `avgDaysToFirstInterview`: `null`; `avgDaysToOffer`: `null`; `companySuccessRates`: `never`[]; `generatedAt`: `string`; `responseRate`: `null`; `totalJobs`: `number`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `number`; `avgDaysToApply`: `number` \| `null`; `avgDaysToFirstInterview`: `number` \| `null`; `avgDaysToOffer`: `number` \| `null`; `companySuccessRates`: `object`[]; `generatedAt`: `string`; `gotResponse`: `number`; `responseRate`: `number` \| `null`; `totalApplied`: `number`; `totalJobs`: `number`; \}\>\>

Defined in: [src/app/api/analytics/roi/route.ts:47](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/analytics/roi/route.ts#L47)

## Parameters

### \_req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `null`; `avgDaysToApply`: `null`; `avgDaysToFirstInterview`: `null`; `avgDaysToOffer`: `null`; `companySuccessRates`: `never`[]; `generatedAt`: `string`; `responseRate`: `null`; `totalJobs`: `number`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `number`; `avgDaysToApply`: `number` \| `null`; `avgDaysToFirstInterview`: `number` \| `null`; `avgDaysToOffer`: `number` \| `null`; `companySuccessRates`: `object`[]; `generatedAt`: `string`; `gotResponse`: `number`; `responseRate`: `number` \| `null`; `totalApplied`: `number`; `totalJobs`: `number`; \}\>\>

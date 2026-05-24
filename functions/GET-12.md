[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `null`; `avgDaysToApply`: `null`; `avgDaysToFirstInterview`: `null`; `avgDaysToOffer`: `null`; `companySuccessRates`: `never`[]; `generatedAt`: `string`; `responseRate`: `null`; `totalJobs`: `number`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `number`; `avgDaysToApply`: `number` \| `null`; `avgDaysToFirstInterview`: `number` \| `null`; `avgDaysToOffer`: `number` \| `null`; `companySuccessRates`: `object`[]; `generatedAt`: `string`; `gotResponse`: `number`; `responseRate`: `number` \| `null`; `totalApplied`: `number`; `totalJobs`: `number`; \}\>\>

Defined in: [src/app/api/analytics/roi/route.ts:46](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/analytics/roi/route.ts#L46)

## Parameters

### \_req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `null`; `avgDaysToApply`: `null`; `avgDaysToFirstInterview`: `null`; `avgDaysToOffer`: `null`; `companySuccessRates`: `never`[]; `generatedAt`: `string`; `responseRate`: `null`; `totalJobs`: `number`; \}\> \| `NextResponse`\<\{ `applicationVelocity`: `number`; `avgDaysToApply`: `number` \| `null`; `avgDaysToFirstInterview`: `number` \| `null`; `avgDaysToOffer`: `number` \| `null`; `companySuccessRates`: `object`[]; `generatedAt`: `string`; `gotResponse`: `number`; `responseRate`: `number` \| `null`; `totalApplied`: `number`; `totalJobs`: `number`; \}\>\>

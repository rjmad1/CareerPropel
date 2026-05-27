[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `generatedAt`: `string`; `insights`: \{ `insights`: `string`[]; `overallHealth`: `string`; `topRecommendation`: `string`; \} \| `null`; `stats`: `StageStats`[]; `totalJobs`: `number`; \}\>\>

Defined in: [src/app/api/analytics/pipeline/route.ts:152](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/analytics/pipeline/route.ts#L152)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `generatedAt`: `string`; `insights`: \{ `insights`: `string`[]; `overallHealth`: `string`; `topRecommendation`: `string`; \} \| `null`; `stats`: `StageStats`[]; `totalJobs`: `number`; \}\>\>

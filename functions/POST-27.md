[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `imported`: `number`; `jobIds`: `string`[]; \}\>\>\>

Defined in: [src/app/api/jobs/import/route.ts:29](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/jobs/import/route.ts#L29)

POST /api/jobs/import
Save scraped jobs as JobImport staging records and immediately
create Job pipeline entries for each.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `imported`: `number`; `jobIds`: `string`[]; \}\>\>\>

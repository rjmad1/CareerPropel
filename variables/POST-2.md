[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Variable: POST

> `const` **POST**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/linkedin/import-profile/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/linkedin/import-profile/route.ts#L23)

POST /api/linkedin/import-profile
Enqueues a public LinkedIn profile scraping task in the asynchronous worker.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<`Record`\<`string`, `string`\>\>

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

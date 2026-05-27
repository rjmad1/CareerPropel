[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Variable: POST

> `const` **POST**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/linkedin/import-profile/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/linkedin/import-profile/route.ts#L23)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Variable: POST

> `const` **POST**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/linkedin/import-profile/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/linkedin/import-profile/route.ts#L23)

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

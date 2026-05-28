[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Variable: POST

> `const` **POST**: (`request`, `context`) => `Promise`\<`Response`\>

Defined in: [src/app/api/linkedin/import-profile/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/linkedin/import-profile/route.ts#L23)

POST /api/linkedin/import-profile
Enqueues a public LinkedIn profile scraping task in the asynchronous worker.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<`Record`\<`string`, `string`\>\>

## Returns

`Promise`\<`Response`\>

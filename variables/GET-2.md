[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Variable: GET

> `const` **GET**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/search/status/route.ts:13](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/jobs/search/status/route.ts#L13)

GET /api/jobs/search/status
Retrieves status and transient results of a queue-driven Indeed/LinkedIn job search task.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<`Record`\<`string`, `string`\>\>

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

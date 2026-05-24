[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Variable: POST

> `const` **POST**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/search/route.ts:27](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/jobs/search/route.ts#L27)

POST /api/jobs/search
Search a job board. If the board is Greenhouse, Lever, or Ashby, it executes synchronously.
If Indeed or LinkedIn, it enqueues the search job asynchronously in the scraping queue.

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<`Record`\<`string`, `string`\>\>

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

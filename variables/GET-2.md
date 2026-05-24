[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Variable: GET

> `const` **GET**: (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/route.ts:17](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/jobs/route.ts#L17)

GET /api/jobs
List all jobs for the authenticated user

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<`Record`\<`string`, `string`\>\>

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

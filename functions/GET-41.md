[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishments`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/accomplishments/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/profile/accomplishments/route.ts#L11)

GET /api/profile/accomplishments
Fetch all achievements staged by the logged-in candidate.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `accomplishments`: `object`[]; \}\>\>

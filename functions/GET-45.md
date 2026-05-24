[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string` \| `number` \| `true` \| `JsonObject` \| `JsonArray`; \}\>\>

Defined in: [src/app/api/profile/recommendations/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/profile/recommendations/route.ts#L11)

GET /api/profile/recommendations?candidateId={id}
Fetch profile improvement recommendations

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string` \| `number` \| `true` \| `JsonObject` \| `JsonArray`; \}\>\>

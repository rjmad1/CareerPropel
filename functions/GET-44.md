[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

Defined in: [src/app/api/profile/entities/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/profile/entities/route.ts#L11)

GET /api/profile/entities?candidateId={id}&type={type}&source={source}
Fetch extracted profile entities

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

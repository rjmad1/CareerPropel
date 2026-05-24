[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

Defined in: [src/app/api/profile/entities/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/profile/entities/route.ts#L11)

GET /api/profile/entities?candidateId={id}&type={type}&source={source}
Fetch extracted profile entities

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

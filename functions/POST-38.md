[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `data`: `any`; `success`: `boolean`; \}\>\>

Defined in: [src/app/api/profile/quantify/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/profile/quantify/route.ts#L11)

POST /api/profile/quantify
Receives a raw accomplishment draft and refines it into a STAR-formatted, quantified achievement.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `data`: `any`; `success`: `boolean`; \}\>\>

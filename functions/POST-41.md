[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `data`: `any`; `success`: `boolean`; \}\>\>

Defined in: [src/app/api/profile/quantify/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/profile/quantify/route.ts#L11)

POST /api/profile/quantify
Receives a raw accomplishment draft and refines it into a STAR-formatted, quantified achievement.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `data`: `any`; `success`: `boolean`; \}\>\>

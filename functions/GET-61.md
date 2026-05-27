[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

Defined in: [src/app/api/profile/entities/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/profile/entities/route.ts#L11)

GET /api/profile/entities?candidateId={id}&type={type}
Fetch profile data entries (resume, cover_letter, linkedin_export, notes, etc.)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `entities`: `object`[]; `total`: `number`; \}\>\>

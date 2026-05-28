[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

Defined in: [src/app/api/analytics/dashboard/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/analytics/dashboard/route.ts#L44)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

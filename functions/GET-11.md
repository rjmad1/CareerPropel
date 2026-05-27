[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

Defined in: [src/app/api/analytics/dashboard/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/analytics/dashboard/route.ts#L44)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

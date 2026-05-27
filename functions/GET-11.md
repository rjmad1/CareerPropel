[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

Defined in: [src/app/api/analytics/dashboard/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/analytics/dashboard/route.ts#L44)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

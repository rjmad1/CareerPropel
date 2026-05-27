[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

Defined in: [src/app/api/analytics/dashboard/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/analytics/dashboard/route.ts#L44)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `domainErrors?`: `Record`\<`string`, `string`\>; `domainsIncluded`: `DomainKey`[]; `generatedAt`: `string`; \}\>\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

Defined in: [src/app/api/ops/dlq/replay/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/ops/dlq/replay/route.ts#L24)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

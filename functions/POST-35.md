[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

Defined in: [src/app/api/ops/dlq/replay/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/ops/dlq/replay/route.ts#L24)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

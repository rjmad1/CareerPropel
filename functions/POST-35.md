[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

Defined in: [src/app/api/ops/dlq/replay/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/ops/dlq/replay/route.ts#L24)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

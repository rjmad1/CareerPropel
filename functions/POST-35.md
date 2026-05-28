[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

Defined in: [src/app/api/ops/dlq/replay/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/ops/dlq/replay/route.ts#L24)

## Parameters

### req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `forced`: `boolean`; `originalExecutionId`: `string`; `replayExecutionId`: `string`; `status`: `string`; \}\>\>

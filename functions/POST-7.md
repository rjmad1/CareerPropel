[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `decision`: [`PlannerDecision`](../interfaces/PlannerDecision.md); `executionId`: `string` \| `null`; \}\>\>

Defined in: [src/app/api/agents/plan/route.ts:17](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/agents/plan/route.ts#L17)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `decision`: [`PlannerDecision`](../interfaces/PlannerDecision.md); `executionId`: `string` \| `null`; \}\>\>

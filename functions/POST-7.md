[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `decision`: [`PlannerDecision`](../interfaces/PlannerDecision.md); `executionId`: `string` \| `null`; \}\>\>

Defined in: [src/app/api/agents/plan/route.ts:17](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/agents/plan/route.ts#L17)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `decision`: [`PlannerDecision`](../interfaces/PlannerDecision.md); `executionId`: `string` \| `null`; \}\>\>

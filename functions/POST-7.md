[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: \{ `decision`: [`ApprovalDecision`](../type-aliases/ApprovalDecision.md); `recorded`: `boolean`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/approvals/\[id\]/decide/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/approvals/[id]/decide/route.ts#L12)

## Parameters

### req

`NextRequest`

### \_\_namedParameters

#### params

\{ `id`: `string`; \}

#### params.id

`string`

## Returns

`Promise`\<`NextResponse`\<\{ `data`: \{ `decision`: [`ApprovalDecision`](../type-aliases/ApprovalDecision.md); `recorded`: `boolean`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

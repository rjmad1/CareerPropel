[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`req`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `data`: \{ `decision`: [`ApprovalDecision`](../type-aliases/ApprovalDecision.md); `recorded`: `boolean`; \}; \}\> \| `NextResponse`\<\{ `error`: \{ `message`: `any`; \}; \}\>\>

Defined in: [src/app/api/approvals/\[id\]/decide/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/approvals/[id]/decide/route.ts#L12)

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

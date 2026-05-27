[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PUT

# Function: PUT()

> **PUT**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `avatarUrl`: `string` \| `null`; `email`: `string`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; \}\>\>\>

Defined in: [src/app/api/account/route.ts:44](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/account/route.ts#L44)

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `avatarUrl`: `string` \| `null`; `email`: `string`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; \}\>\>\>

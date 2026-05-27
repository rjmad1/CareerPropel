[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; \} \| `null`\>\>\>

Defined in: [src/app/api/account/route.ts:20](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/account/route.ts#L20)

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; \} \| `null`\>\>\>

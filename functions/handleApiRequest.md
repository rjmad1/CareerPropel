[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / handleApiRequest

# Function: handleApiRequest()

> **handleApiRequest**\<`T`\>(`handler`, `successStatus?`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md) \| [`SuccessResponse`](../interfaces/SuccessResponse.md)\<`T`\>\>\>

Defined in: [src/lib/utils/apiResponse.ts:44](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/utils/apiResponse.ts#L44)

## Type Parameters

### T

`T`

## Parameters

### handler

() => `Promise`\<`T`\>

### successStatus?

`number` = `200`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md) \| [`SuccessResponse`](../interfaces/SuccessResponse.md)\<`T`\>\>\>

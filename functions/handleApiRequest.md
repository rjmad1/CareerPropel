[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / handleApiRequest

# Function: handleApiRequest()

> **handleApiRequest**\<`T`\>(`handler`, `successStatus?`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md) \| [`SuccessResponse`](../interfaces/SuccessResponse.md)\<`T`\>\>\>

Defined in: [src/lib/utils/apiResponse.ts:44](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/utils/apiResponse.ts#L44)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / handleApiRequest

# Function: handleApiRequest()

> **handleApiRequest**\<`T`\>(`handler`, `successStatus?`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md) \| [`SuccessResponse`](../interfaces/SuccessResponse.md)\<`T`\>\>\>

Defined in: [src/lib/utils/apiResponse.ts:44](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/utils/apiResponse.ts#L44)

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

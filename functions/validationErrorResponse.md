[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / validationErrorResponse

# Function: validationErrorResponse()

> **validationErrorResponse**(`error`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:45](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/middleware/validation.ts#L45)

Format validation error response

## Parameters

### error

[`ValidationError`](../classes/ValidationError.md)

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

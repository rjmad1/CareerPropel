[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / validationErrorResponse

# Function: validationErrorResponse()

> **validationErrorResponse**(`error`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:45](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/middleware/validation.ts#L45)

Format validation error response

## Parameters

### error

[`ValidationError`](../classes/ValidationError.md)

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

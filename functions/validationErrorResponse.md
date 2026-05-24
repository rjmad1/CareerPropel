[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / validationErrorResponse

# Function: validationErrorResponse()

> **validationErrorResponse**(`error`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:45](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/middleware/validation.ts#L45)

Format validation error response

## Parameters

### error

[`ValidationError`](../classes/ValidationError.md)

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `details`: `Record`\<`string`, `string`[]\>; `message`: `string`; \}; \}\>

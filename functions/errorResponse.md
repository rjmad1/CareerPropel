[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / errorResponse

# Function: errorResponse()

> **errorResponse**(`error`, `statusCode?`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:68](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/middleware/validation.ts#L68)

Error response formatter

## Parameters

### error

`any`

### statusCode?

`number` = `500`

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

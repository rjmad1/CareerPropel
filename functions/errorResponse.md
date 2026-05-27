[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / errorResponse

# Function: errorResponse()

> **errorResponse**(`error`, `statusCode?`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:68](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/middleware/validation.ts#L68)

Error response formatter

## Parameters

### error

`any`

### statusCode?

`number` = `500`

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / errorResponse

# Function: errorResponse()

> **errorResponse**(`error`, `statusCode?`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:68](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/middleware/validation.ts#L68)

Error response formatter

## Parameters

### error

`any`

### statusCode?

`number` = `500`

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

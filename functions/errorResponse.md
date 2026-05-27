[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / errorResponse

# Function: errorResponse()

> **errorResponse**(`error`, `statusCode?`): `NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

Defined in: [src/app/api/middleware/validation.ts:68](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/middleware/validation.ts#L68)

Error response formatter

## Parameters

### error

`any`

### statusCode?

`number` = `500`

## Returns

`NextResponse`\<\{ `error`: \{ `code`: `string`; `message`: `any`; \}; \}\>

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ApiErrors

# Variable: ApiErrors

> `const` **ApiErrors**: `object`

Defined in: [src/lib/errors/ApiError.ts:48](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/errors/ApiError.ts#L48)

## Type Declaration

### CONFLICT

> **CONFLICT**: (`details`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### details

`string`

#### Returns

[`ApiError`](../classes/ApiError.md)

### DATABASE\_ERROR

> **DATABASE\_ERROR**: (`internalError?`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### internalError?

`unknown`

#### Returns

[`ApiError`](../classes/ApiError.md)

### FORBIDDEN

> **FORBIDDEN**: (`resource`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### resource?

`string` = `'resource'`

#### Returns

[`ApiError`](../classes/ApiError.md)

### INTERNAL\_ERROR

> **INTERNAL\_ERROR**: (`internalError?`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### internalError?

`unknown`

#### Returns

[`ApiError`](../classes/ApiError.md)

### INVALID\_REQUEST

> **INVALID\_REQUEST**: (`details`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### details

`string`

#### Returns

[`ApiError`](../classes/ApiError.md)

### NOT\_FOUND

> **NOT\_FOUND**: (`resource`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### resource?

`string` = `'resource'`

#### Returns

[`ApiError`](../classes/ApiError.md)

### RATE\_LIMIT

> **RATE\_LIMIT**: () => [`ApiError`](../classes/ApiError.md)

#### Returns

[`ApiError`](../classes/ApiError.md)

### UNAUTHORIZED

> **UNAUTHORIZED**: () => [`ApiError`](../classes/ApiError.md)

#### Returns

[`ApiError`](../classes/ApiError.md)

### VALIDATION\_ERROR

> **VALIDATION\_ERROR**: (`details`) => [`ApiError`](../classes/ApiError.md)

#### Parameters

##### details

`string`

#### Returns

[`ApiError`](../classes/ApiError.md)

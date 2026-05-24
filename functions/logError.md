[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logError

# Function: logError()

> **logError**(`logger`, `err`, `message`, `extra?`): `void`

Defined in: [src/lib/logging/logger.ts:67](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/logging/logger.ts#L67)

Safe wrapper for logging errors. Ensures the `Error` object is serialized
via pino's built-in `err` serializer (includes `message`, `stack`, `name`).

## Parameters

### logger

`Logger`\<`never`\>

### err

`unknown`

### message

`string`

### extra?

`Record`\<`string`, `unknown`\>

## Returns

`void`

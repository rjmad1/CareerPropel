[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logError

# Function: logError()

> **logError**(`logger`, `err`, `message`, `extra?`): `void`

Defined in: [src/lib/logging/logger.ts:67](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/logging/logger.ts#L67)

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

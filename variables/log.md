[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / log

# Variable: log

> `const` **log**: `Logger`\<`never`\>

Defined in: [src/lib/logging/logger.ts:27](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/logging/logger.ts#L27)

Root application logger.
In production, emits newline-delimited JSON.
In development, pretty-prints with pino-pretty if available; falls back to JSON.

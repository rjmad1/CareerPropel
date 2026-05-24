[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / log

# Variable: log

> `const` **log**: `Logger`\<`never`\>

Defined in: [src/lib/logging/logger.ts:27](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/logging/logger.ts#L27)

Root application logger.
In production, emits newline-delimited JSON.
In development, pretty-prints with pino-pretty if available; falls back to JSON.

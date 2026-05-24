[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / log

# Variable: log

> `const` **log**: `Logger`\<`never`\>

Defined in: [src/lib/logging/logger.ts:27](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/logger.ts#L27)

Root application logger.
In production, emits newline-delimited JSON.
In development, pretty-prints with pino-pretty if available; falls back to JSON.

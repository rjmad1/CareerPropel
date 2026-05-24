[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / childLog

# Function: childLog()

> **childLog**(`bindings`): `Logger`\<`never`\>

Defined in: [src/lib/logging/logger.ts:59](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/logging/logger.ts#L59)

Create a child logger pre-bound to a specific request/operation context.
Attach `requestId` so every downstream log line carries it automatically.

## Parameters

### bindings

`Record`\<`string`, `unknown`\>

## Returns

`Logger`\<`never`\>

## Example

```ts
const reqLog = childLog({ requestId: 'abc-123', userId: 'user-456' });
  reqLog.info('Processing agent execution');
```

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRouteState

# Function: useRouteState()

> **useRouteState**\<`T`\>(`parse`, `_defaults`): \[`T`, (`partial`) => `void`\]

Defined in: [src/hooks/useRouteState.ts:31](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useRouteState.ts#L31)

Read URL state with typed parsing, write changes back via router.replace().

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

## Parameters

### parse

`StateParser`\<`T`\>

Function that converts URLSearchParams → typed state object

### \_defaults

`T`

## Returns

\[`T`, (`partial`) => `void`\]

[state, setState] tuple

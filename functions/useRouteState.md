[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRouteState

# Function: useRouteState()

> **useRouteState**\<`T`\>(`parse`, `_defaults`): \[`T`, (`partial`) => `void`\]

Defined in: [src/hooks/useRouteState.ts:31](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useRouteState.ts#L31)

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

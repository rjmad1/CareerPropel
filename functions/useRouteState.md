[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRouteState

# Function: useRouteState()

> **useRouteState**\<`T`\>(`parse`, `_defaults`): \[`T`, (`partial`) => `void`\]

Defined in: [src/hooks/useRouteState.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/hooks/useRouteState.ts#L31)

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

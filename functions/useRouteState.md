[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useRouteState

# Function: useRouteState()

> **useRouteState**\<`T`\>(`parse`, `_defaults`): \[`T`, (`partial`) => `void`\]

Defined in: [src/hooks/useRouteState.ts:31](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useRouteState.ts#L31)

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

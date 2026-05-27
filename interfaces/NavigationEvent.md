[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / NavigationEvent

# Interface: NavigationEvent

Defined in: [src/lib/navigation/analytics.ts:34](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L34)

## Properties

### durationMs?

> `optional` **durationMs?**: `number`

Defined in: [src/lib/navigation/analytics.ts:41](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L41)

Duration in ms (for latency events)

***

### from?

> `optional` **from?**: `string`

Defined in: [src/lib/navigation/analytics.ts:37](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L37)

Route being navigated FROM

***

### meta?

> `optional` **meta?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/navigation/analytics.ts:43](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L43)

Contextual extras

***

### timestamp

> **timestamp**: `number`

Defined in: [src/lib/navigation/analytics.ts:44](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L44)

***

### to?

> `optional` **to?**: `string`

Defined in: [src/lib/navigation/analytics.ts:39](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L39)

Route being navigated TO

***

### type

> **type**: [`NavigationEventType`](../type-aliases/NavigationEventType.md)

Defined in: [src/lib/navigation/analytics.ts:35](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/navigation/analytics.ts#L35)

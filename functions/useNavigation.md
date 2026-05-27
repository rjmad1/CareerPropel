[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useNavigation

# Function: useNavigation()

> **useNavigation**(): `object`

Defined in: [src/hooks/useNavigation.ts:28](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useNavigation.ts#L28)

## Returns

`object`

### goBack

> **goBack**: () => `void`

#### Returns

`void`

### goHome

> **goHome**: () => `boolean`

#### Returns

`boolean`

### navigate

> **navigate**: (`href`, `options?`) => `boolean`

#### Parameters

##### href

`string`

##### options?

[`NavigateOptions`](../interfaces/NavigateOptions.md)

#### Returns

`boolean`

### navigateReplace

> **navigateReplace**: (`href`, `options?`) => `boolean`

#### Parameters

##### href

`string`

##### options?

`Omit`\<[`NavigateOptions`](../interfaces/NavigateOptions.md), `"replace"`\>

#### Returns

`boolean`

### prefetch

> **prefetch**: (`href`) => `void`

#### Parameters

##### href

`string`

#### Returns

`void`

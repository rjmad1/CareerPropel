[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useNavigation

# Function: useNavigation()

> **useNavigation**(): `object`

Defined in: [src/hooks/useNavigation.ts:28](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useNavigation.ts#L28)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useNavigation

# Function: useNavigation()

> **useNavigation**(): `object`

Defined in: [src/hooks/useNavigation.ts:28](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useNavigation.ts#L28)

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

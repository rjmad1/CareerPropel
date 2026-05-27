[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useNavigation

# Function: useNavigation()

> **useNavigation**(): `object`

Defined in: [src/hooks/useNavigation.ts:28](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useNavigation.ts#L28)

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

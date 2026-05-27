[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseProfileResult

# Interface: UseProfileResult

Defined in: [src/hooks/useProfile.ts:11](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L11)

## Properties

### addEntity

> **addEntity**: (`entity`) => `void`

Defined in: [src/hooks/useProfile.ts:22](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L22)

#### Parameters

##### entity

[`ProfileEntity`](ProfileEntity.md)

#### Returns

`void`

***

### discardChanges

> **discardChanges**: () => `void`

Defined in: [src/hooks/useProfile.ts:25](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L25)

#### Returns

`void`

***

### entities

> **entities**: [`ProfileEntity`](ProfileEntity.md)[]

Defined in: [src/hooks/useProfile.ts:14](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L14)

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useProfile.ts:17](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L17)

***

### isStale

> **isStale**: `boolean`

Defined in: [src/hooks/useProfile.ts:28](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L28)

***

### lastFetch

> **lastFetch**: `Date` \| `null`

Defined in: [src/hooks/useProfile.ts:29](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L29)

***

### loading

> **loading**: `boolean`

Defined in: [src/hooks/useProfile.ts:16](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L16)

***

### profile

> **profile**: [`ProfileSummary`](ProfileSummary.md) \| `null`

Defined in: [src/hooks/useProfile.ts:12](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L12)

***

### recommendations

> **recommendations**: [`ProfileRecommendation`](ProfileRecommendation.md)[]

Defined in: [src/hooks/useProfile.ts:15](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L15)

***

### refresh

> **refresh**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useProfile.ts:24](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L24)

#### Returns

`Promise`\<`void`\>

***

### removeEntity

> **removeEntity**: (`id`) => `void`

Defined in: [src/hooks/useProfile.ts:23](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L23)

#### Parameters

##### id

`string`

#### Returns

`void`

***

### score

> **score**: [`ProfileScore`](ProfileScore.md) \| `null`

Defined in: [src/hooks/useProfile.ts:13](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L13)

***

### unsavedChanges

> **unsavedChanges**: `boolean`

Defined in: [src/hooks/useProfile.ts:18](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L18)

***

### updateProfile

> **updateProfile**: (`data`) => `Promise`\<`void`\>

Defined in: [src/hooks/useProfile.ts:21](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L21)

#### Parameters

##### data

`Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`void`\>

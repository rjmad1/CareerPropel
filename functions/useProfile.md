[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useProfile

# Function: useProfile()

> **useProfile**(`candidateId`, `options?`): [`UseProfileResult`](../interfaces/UseProfileResult.md)

Defined in: [src/hooks/useProfile.ts:42](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useProfile.ts#L42)

Hook for managing user profile state

Features:
- Profile data fetching and caching
- Automatic staleness detection
- Change tracking
- Entity management
- Recommendation fetching

## Parameters

### candidateId

`string`

### options?

#### autoRefresh?

`boolean`

#### cacheTTL?

`number`

#### onStaleDetected?

() => `void`

## Returns

[`UseProfileResult`](../interfaces/UseProfileResult.md)

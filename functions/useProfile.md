[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useProfile

# Function: useProfile()

> **useProfile**(`candidateId`, `options?`): [`UseProfileResult`](../interfaces/UseProfileResult.md)

Defined in: [src/hooks/useProfile.ts:42](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useProfile.ts#L42)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useJobSocket

# Function: useJobSocket()

> **useJobSocket**(`jobId`): `object`

Defined in: [src/hooks/useSocket.ts:94](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/hooks/useSocket.ts#L94)

Hook to subscribe to a specific job's real-time updates

Usage:
  const { subscribe, unsubscribe, isSubscribed } = useJobSocket(jobId)
  
  useEffect(() => {
    subscribe()
    return () => unsubscribe()
  }, [jobId])

## Parameters

### jobId

`string`

## Returns

`object`

### isSubscribed

> **isSubscribed**: `boolean`

### jobData

> **jobData**: `any`

### onlineUsers

> **onlineUsers**: `any`[]

### socket

> **socket**: `Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

### subscribe

> **subscribe**: () => `void`

#### Returns

`void`

### unsubscribe

> **unsubscribe**: () => `void`

#### Returns

`void`

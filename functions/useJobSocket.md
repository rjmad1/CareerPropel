[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useJobSocket

# Function: useJobSocket()

> **useJobSocket**(`jobId`): `object`

Defined in: [src/hooks/useSocket.ts:94](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useSocket.ts#L94)

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

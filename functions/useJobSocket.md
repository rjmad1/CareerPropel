[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useJobSocket

# Function: useJobSocket()

> **useJobSocket**(`jobId`): `object`

Defined in: [src/hooks/useSocket.ts:94](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/hooks/useSocket.ts#L94)

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

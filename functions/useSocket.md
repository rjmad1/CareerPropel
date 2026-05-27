[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useSocket

# Function: useSocket()

> **useSocket**(`options?`): `Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

Defined in: [src/hooks/useSocket.ts:19](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useSocket.ts#L19)

React hook for Socket.io integration
Automatically handles authentication and cleanup

Usage:
  const socket = useSocket()
  socket?.emit('subscribe:job', jobId)
  socket?.on('job:updated', (data) => console.log(data))

## Parameters

### options?

`UseSocketOptions` = `{}`

## Returns

`Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

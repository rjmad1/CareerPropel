[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useSocket

# Function: useSocket()

> **useSocket**(`options?`): `Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

Defined in: [src/hooks/useSocket.ts:19](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/hooks/useSocket.ts#L19)

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

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useSocket

# Function: useSocket()

> **useSocket**(`options?`): `Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

Defined in: [src/hooks/useSocket.ts:19](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/hooks/useSocket.ts#L19)

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

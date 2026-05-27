[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useSocket

# Function: useSocket()

> **useSocket**(`options?`): `Socket`\<`DefaultEventsMap`, `DefaultEventsMap`\> \| `null`

Defined in: [src/hooks/useSocket.ts:19](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useSocket.ts#L19)

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

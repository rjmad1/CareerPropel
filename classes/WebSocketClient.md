[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / WebSocketClient

# Class: WebSocketClient

Defined in: [src/lib/websocket/client.ts:18](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L18)

## Constructors

### Constructor

> **new WebSocketClient**(`config`): `WebSocketClient`

Defined in: [src/lib/websocket/client.ts:28](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L28)

#### Parameters

##### config

`WebSocketConfig`

#### Returns

`WebSocketClient`

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [src/lib/websocket/client.ts:40](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L40)

Connect to WebSocket server

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

Defined in: [src/lib/websocket/client.ts:92](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L92)

Disconnect from WebSocket

#### Returns

`void`

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [src/lib/websocket/client.ts:146](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L146)

Check if connected

#### Returns

`boolean`

***

### onConnectionChange()

> **onConnectionChange**(`handler`): () => `void`

Defined in: [src/lib/websocket/client.ts:134](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L134)

Subscribe to connection state changes

#### Parameters

##### handler

`ConnectionHandler`

#### Returns

() => `void`

***

### send()

> **send**(`message`): `void`

Defined in: [src/lib/websocket/client.ts:104](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L104)

Send a message to the server

#### Parameters

##### message

[`AnyWebSocketMessage`](../type-aliases/AnyWebSocketMessage.md)

#### Returns

`void`

***

### subscribe()

> **subscribe**(`type`, `handler`): () => `void`

Defined in: [src/lib/websocket/client.ts:116](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L116)

Subscribe to message types

#### Parameters

##### type

`string`

##### handler

`MessageHandler`

#### Returns

() => `void`

***

### subscribeToChannels()

> **subscribeToChannels**(`channels`): `void`

Defined in: [src/lib/websocket/client.ts:153](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L153)

Request subscription to channels

#### Parameters

##### channels

`string`[]

#### Returns

`void`

***

### unsubscribeFromChannels()

> **unsubscribeFromChannels**(`channels`): `void`

Defined in: [src/lib/websocket/client.ts:164](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/websocket/client.ts#L164)

Request unsubscription from channels

#### Parameters

##### channels

`string`[]

#### Returns

`void`

[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / RedisConfig

# Interface: RedisConfig

Defined in: [src/infrastructure/redis/config.ts:6](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/infrastructure/redis/config.ts#L6)

## Extends

- `RedisOptions`

## Properties

### autoPipeliningIgnoredCommands?

> `optional` **autoPipeliningIgnoredCommands?**: `string`[]

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:156

#### Default

```ts
[]
```

#### Inherited from

`RedisOptions.autoPipeliningIgnoredCommands`

***

### autoResendUnfulfilledCommands?

> `optional` **autoResendUnfulfilledCommands?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:89

Whether or not to resend unfulfilled commands on reconnect.
Unfulfilled commands are most likely to be blocking commands such as `brpop` or `blpop`.

#### Default

```ts
true
```

#### Inherited from

`RedisOptions.autoResendUnfulfilledCommands`

***

### autoResubscribe?

> `optional` **autoResubscribe?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:83

When the client reconnects, channels subscribed in the previous connection will be
resubscribed automatically if `autoResubscribe` is `true`.

#### Default

```ts
true
```

#### Inherited from

`RedisOptions.autoResubscribe`

***

### blockingTimeout?

> `optional` **blockingTimeout?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:20

Enables client-side timeout protection for blocking commands when set
to a positive number. If `blockingTimeout` is undefined, `0`, or
negative (e.g. `-1`), the protection is disabled and no client-side
timers are installed for blocking commands.

#### Inherited from

`RedisOptions.blockingTimeout`

***

### blockingTimeoutGrace?

> `optional` **blockingTimeoutGrace?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:25

Grace period (ms) added to blocking command timeouts. Only used when
`blockingTimeout` is a positive number. Defaults to 100ms.

#### Inherited from

`RedisOptions.blockingTimeoutGrace`

***

### clientInfoTag?

> `optional` **clientInfoTag?**: `string`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:62

Tag to append to the library name in CLIENT SETINFO (ioredis(tag)).

#### Link

https://redis.io/docs/latest/commands/client-setinfo/

#### Default

```ts
undefined
```

#### Inherited from

`RedisOptions.clientInfoTag`

***

### commandQueue?

> `optional` **commandQueue?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:158

#### Inherited from

`RedisOptions.commandQueue`

***

### commandTimeout?

> `optional` **commandTimeout?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:13

If a command does not return a reply within a set number of milliseconds,
a "Command timed out" error will be thrown.

#### Inherited from

`RedisOptions.commandTimeout`

***

### connectionName?

> `optional` **connectionName?**: `string`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:50

Set the name of the connection to make it easier to identity the connection
in client list.

#### Link

https://redis.io/commands/client-setname

#### Inherited from

`RedisOptions.connectionName`

***

### Connector?

> `optional` **Connector?**: `ConnectorConstructor`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:7

#### Inherited from

`RedisOptions.Connector`

***

### connectTimeout

> **connectTimeout**: `number`

Defined in: [src/infrastructure/redis/config.ts:7](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/infrastructure/redis/config.ts#L7)

How long the client will wait before killing a socket due to inactivity during initial connection.

#### Default

```ts
10000
```

#### Overrides

`RedisOptions.connectTimeout`

***

### db?

> `optional` **db?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:77

Database index to use.

#### Default

```ts
0
```

#### Inherited from

`RedisOptions.db`

***

### disableClientInfo?

> `optional` **disableClientInfo?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:56

If true, skips setting library info via CLIENT SETINFO.

#### Link

https://redis.io/docs/latest/commands/client-setinfo/

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.disableClientInfo`

***

### disconnectTimeout?

> `optional` **disconnectTimeout?**: `number`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:41

#### Inherited from

`RedisOptions.disconnectTimeout`

***

### enableAutoPipelining?

> `optional` **enableAutoPipelining?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:152

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.enableAutoPipelining`

***

### enableOfflineQueue?

> `optional` **enableOfflineQueue?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:169

By default, if the connection to Redis server has not been established, commands are added to a queue
and are executed once the connection is "ready" (when `enableReadyCheck` is true, "ready" means
the Redis server has loaded the database from disk, otherwise means the connection to the Redis
server has been established). If this option is false, when execute the command when the connection
isn't ready, an error will be returned.

#### Default

```ts
true
```

#### Inherited from

`RedisOptions.enableOfflineQueue`

***

### enableReadyCheck?

> `optional` **enableReadyCheck?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:177

The client will sent an INFO command to check whether the server is still loading data from the disk (
which happens when the server is just launched) when the connection is established, and only wait until
the loading process is finished before emitting the `ready` event.

#### Default

```ts
true
```

#### Inherited from

`RedisOptions.enableReadyCheck`

***

### enableTLSForSentinelMode?

> `optional` **enableTLSForSentinelMode?**: `boolean`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:43

#### Inherited from

`RedisOptions.enableTLSForSentinelMode`

***

### failoverDetector?

> `optional` **failoverDetector?**: `boolean`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:51

#### Inherited from

`RedisOptions.failoverDetector`

***

### family?

> `optional` **family?**: `number`

Defined in: node\_modules/@types/node/net.d.ts:60

#### Inherited from

`RedisOptions.family`

***

### host?

> `optional` **host?**: `string`

Defined in: node\_modules/@types/node/net.d.ts:56

#### Inherited from

`RedisOptions.host`

***

### keepAlive?

> `optional` **keepAlive?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:38

Enable/disable keep-alive functionality.

#### Link

https://nodejs.org/api/net.html#socketsetkeepaliveenable-initialdelay

#### Default

```ts
0
```

#### Inherited from

`RedisOptions.keepAlive`

***

### keyPrefix?

> `optional` **keyPrefix?**: `string`

Defined in: node\_modules/ioredis/built/utils/Commander.d.ts:5

#### Inherited from

`RedisOptions.keyPrefix`

***

### lazyConnect?

> `optional` **lazyConnect?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:186

When a Redis instance is initialized, a connection to the server is immediately established. Set this to
true will delay the connection to the server until the first command is sent or `redis.connect()` is called
explicitly. When `redis.connect()` is called explicitly, a Promise is returned, which will be resolved
when the connection is ready or rejected when it fails. The rejection should be handled by the user.

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.lazyConnect`

***

### maxLoadingRetryTime?

> `optional` **maxLoadingRetryTime?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:148

#### Default

```ts
10000
```

#### Inherited from

`RedisOptions.maxLoadingRetryTime`

***

### maxRetriesPerRequest?

> `optional` **maxRetriesPerRequest?**: `number` \| `null`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:144

The commands that don't get a reply due to the connection to the server is lost are
put into a queue and will be resent on reconnect (if allowed by the `retryStrategy` option).
This option is used to configure how many reconnection attempts should be allowed before
the queue is flushed with a `MaxRetriesPerRequestError` error.
Set this options to `null` instead of a number to let commands wait forever
until the connection is alive again.

#### Default

```ts
20
```

#### Inherited from

`RedisOptions.maxRetriesPerRequest`

***

### maxRetryDelay

> **maxRetryDelay**: `number`

Defined in: [src/infrastructure/redis/config.ts:8](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/infrastructure/redis/config.ts#L8)

***

### monitor?

> `optional` **monitor?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:133

This option is used internally when you call `redis.monitor()` to tell Redis
to enter the monitor mode when the connection is established.

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.monitor`

***

### name?

> `optional` **name?**: `string`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:28

Master group name of the Sentinel

#### Inherited from

`RedisOptions.name`

***

### natMap?

> `optional` **natMap?**: `NatMap`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:45

#### Inherited from

`RedisOptions.natMap`

***

### noDelay?

> `optional` **noDelay?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:44

Enable/disable the use of Nagle's algorithm.

#### Link

https://nodejs.org/api/net.html#socketsetnodelaynodelay

#### Default

```ts
true
```

#### Inherited from

`RedisOptions.noDelay`

***

### offlineQueue?

> `optional` **offlineQueue?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:157

#### Inherited from

`RedisOptions.offlineQueue`

***

### password?

> `optional` **password?**: `string`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:71

If set, client will send AUTH command with the value of this option when connected.

#### Inherited from

`RedisOptions.password`

***

### path?

> `optional` **path?**: `string`

Defined in: node\_modules/@types/node/net.d.ts:75

#### Inherited from

`RedisOptions.path`

***

### port?

> `optional` **port?**: `number`

Defined in: node\_modules/@types/node/net.d.ts:55

#### Inherited from

`RedisOptions.port`

***

### preferredSlaves?

> `optional` **preferredSlaves?**: `PreferredSlaves`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:39

#### Inherited from

`RedisOptions.preferredSlaves`

***

### readOnly?

> `optional` **readOnly?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:115

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.readOnly`

***

### reconnectOnError?

> `optional` **reconnectOnError?**: `ReconnectOnError` \| `null`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:111

Whether or not to reconnect on certain Redis errors.
This options by default is `null`, which means it should never reconnect on Redis errors.
You can pass a function that accepts an Redis error, and returns:
- `true` or `1` to trigger a reconnection.
- `false` or `0` to not reconnect.
- `2` to reconnect and resend the failed command (who triggered the error) after reconnection.

#### Example

```js
const redis = new Redis({
  reconnectOnError(err) {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true; // or `return 1;`
    }
  },
});
```

#### Default

```ts
null
```

#### Inherited from

`RedisOptions.reconnectOnError`

***

### retryBudget

> **retryBudget**: `number`

Defined in: [src/infrastructure/redis/config.ts:9](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/infrastructure/redis/config.ts#L9)

***

### retryStrategy?

> `optional` **retryStrategy?**: (`times`) => `number` \| `void` \| `null`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:8

#### Parameters

##### times

`number`

#### Returns

`number` \| `void` \| `null`

#### Inherited from

`RedisOptions.retryStrategy`

***

### role?

> `optional` **role?**: `"master"` \| `"slave"`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:32

#### Default

```ts
"master"
```

#### Inherited from

`RedisOptions.role`

***

### scripts?

> `optional` **scripts?**: `Record`\<`string`, \{ `lua`: `string`; `numberOfKeys?`: `number`; `readOnly?`: `boolean`; \}\>

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:190

#### Default

```ts
undefined
```

#### Inherited from

`RedisOptions.scripts`

***

### sentinelCommandTimeout?

> `optional` **sentinelCommandTimeout?**: `number`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:42

#### Inherited from

`RedisOptions.sentinelCommandTimeout`

***

### sentinelMaxConnections?

> `optional` **sentinelMaxConnections?**: `number`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:50

#### Default

```ts
10
```

#### Inherited from

`RedisOptions.sentinelMaxConnections`

***

### sentinelPassword?

> `optional` **sentinelPassword?**: `string`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:35

#### Inherited from

`RedisOptions.sentinelPassword`

***

### sentinelReconnectStrategy?

> `optional` **sentinelReconnectStrategy?**: (`retryAttempts`) => `number` \| `void` \| `null`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:38

#### Parameters

##### retryAttempts

`number`

#### Returns

`number` \| `void` \| `null`

#### Inherited from

`RedisOptions.sentinelReconnectStrategy`

***

### sentinelRetryStrategy?

> `optional` **sentinelRetryStrategy?**: (`retryAttempts`) => `number` \| `void` \| `null`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:37

#### Parameters

##### retryAttempts

`number`

#### Returns

`number` \| `void` \| `null`

#### Inherited from

`RedisOptions.sentinelRetryStrategy`

***

### sentinels?

> `optional` **sentinels?**: `Partial`\<`SentinelAddress`\>[]

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:36

#### Inherited from

`RedisOptions.sentinels`

***

### sentinelTLS?

> `optional` **sentinelTLS?**: `ConnectionOptions`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:44

#### Inherited from

`RedisOptions.sentinelTLS`

***

### sentinelUsername?

> `optional` **sentinelUsername?**: `string`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:34

#### Inherited from

`RedisOptions.sentinelUsername`

***

### showFriendlyErrorStack?

> `optional` **showFriendlyErrorStack?**: `boolean`

Defined in: node\_modules/ioredis/built/utils/Commander.d.ts:6

#### Inherited from

`RedisOptions.showFriendlyErrorStack`

***

### socketTimeout?

> `optional` **socketTimeout?**: `number`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:32

If the socket does not receive data within a set number of milliseconds:
1. the socket is considered "dead" and will be destroyed
2. the client will reject any running commands (altought they might have been processed by the server)
3. the reconnect strategy will kick in (depending on the configuration)

#### Inherited from

`RedisOptions.socketTimeout`

***

### stringNumbers?

> `optional` **stringNumbers?**: `boolean`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:121

When enabled, numbers returned by Redis will be converted to JavaScript strings instead of numbers.
This is necessary if you want to handle big numbers (above `Number.MAX_SAFE_INTEGER` === 2^53).

#### Default

```ts
false
```

#### Inherited from

`RedisOptions.stringNumbers`

***

### tls?

> `optional` **tls?**: `ConnectionOptions`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:33

#### Inherited from

`RedisOptions.tls`

***

### updateSentinels?

> `optional` **updateSentinels?**: `boolean`

Defined in: node\_modules/ioredis/built/connectors/SentinelConnector/index.d.ts:46

#### Inherited from

`RedisOptions.updateSentinels`

***

### username?

> `optional` **username?**: `string`

Defined in: node\_modules/ioredis/built/redis/RedisOptions.d.ts:67

If set, client will send AUTH command with the value of this option as the first argument when connected.
This is supported since Redis 6.

#### Inherited from

`RedisOptions.username`

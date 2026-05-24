[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentRealTime

# Function: useAgentRealTime()

> **useAgentRealTime**(`candidateId`, `options?`): [`UseAgentRealTimeResult`](../interfaces/UseAgentRealTimeResult.md)

Defined in: [src/hooks/useAgentRealTime.ts:30](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/hooks/useAgentRealTime.ts#L30)

Hook for global agent status and real-time updates

Features:
- Manages all agent states
- Real-time WebSocket updates
- Batched updates to prevent thrashing
- Polling fallback
- Agent metrics aggregation

## Parameters

### candidateId

`string`

### options?

#### autoConnect?

`boolean`

#### batchDelay?

`number`

#### refreshInterval?

`number`

## Returns

[`UseAgentRealTimeResult`](../interfaces/UseAgentRealTimeResult.md)

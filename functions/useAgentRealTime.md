[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentRealTime

# Function: useAgentRealTime()

> **useAgentRealTime**(`candidateId`, `options?`): [`UseAgentRealTimeResult`](../interfaces/UseAgentRealTimeResult.md)

Defined in: [src/hooks/useAgentRealTime.ts:30](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useAgentRealTime.ts#L30)

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

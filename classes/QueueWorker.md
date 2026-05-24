[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / QueueWorker

# ~~Class: QueueWorker~~

Defined in: [src/lib/queues/workers.ts:22](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/queues/workers.ts#L22)

## Deprecated

RASUI-001 / RASUI-011 — THIS FILE IS DEPRECATED.

The QueueWorker / JobQueue system in this file contained only stub
implementations returning hardcoded fake data. It was never wired to
production startup and operated completely independently of the real
agent executor.

The single canonical agent execution path is:
  src/lib/agents/executor.ts → processPendingExecutions()
  ↓ scheduled via
  vercel.json cron → GET /api/agents/execute-pending

This file is retained temporarily to avoid breaking any compile-time
imports. All worker methods now throw immediately to surface any remaining
callers that must be migrated. Delete this file after confirming zero callers.

Audit finding: RASUI-001 (stub implementations return fake data silently)
Root cause eliminated: dual execution path removed; DB executor is canonical

## Constructors

### Constructor

> **new QueueWorker**(): `QueueWorker`

#### Returns

`QueueWorker`

## Methods

### ~~start()~~

> **start**(): `Promise`\<`never`\>

Defined in: [src/lib/queues/workers.ts:23](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/queues/workers.ts#L23)

#### Returns

`Promise`\<`never`\>

***

### ~~stop()~~

> **stop**(): `void`

Defined in: [src/lib/queues/workers.ts:31](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/queues/workers.ts#L31)

#### Returns

`void`

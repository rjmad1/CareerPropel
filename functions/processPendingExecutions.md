[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / processPendingExecutions

# Function: processPendingExecutions()

> **processPendingExecutions**(): `Promise`\<`number`\>

Defined in: [src/lib/agents/executor.ts:288](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/agents/executor.ts#L288)

Find and execute ONE pending agent execution (called by background polling cron).

Design decisions:
- Processes exactly ONE execution per HTTP invocation to stay within serverless
  function time limits. The cron frequency (vercel.json) controls throughput.
- Uses claimExecution() for optimistic concurrency — concurrent invocations
  cannot double-process the same execution record.
- Calls recoverStuckExecutions() on every invocation for self-healing.

Returns: number of executions processed (0 or 1).

## Returns

`Promise`\<`number`\>

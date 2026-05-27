[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createRateLimiter

# Function: createRateLimiter()

> **createRateLimiter**(`maxRequests?`, `windowSecs?`): (`request`) => `Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

Defined in: [src/lib/middleware/rateLimiter.ts:93](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/middleware/rateLimiter.ts#L93)

Create a scoped rate limiter for a specific endpoint.

## Parameters

### maxRequests?

`number` = `10`

Maximum number of requests allowed in the window.

### windowSecs?

`number` = `60`

Window duration in SECONDS (not milliseconds).
                     Common values: 60 (1 minute), 3600 (1 hour).

RASUI-007 footgun detection: if windowSecs > 3600 (1 hour), this almost
certainly indicates the caller passed milliseconds instead of seconds
(e.g. `createRateLimiter(100, 60000)` instead of `createRateLimiter(100, 60)`).
A runtime error is thrown immediately to surface the bug.

## Returns

(`request`) => `Promise`\<`NextResponse`\<`unknown`\> \| `null`\>

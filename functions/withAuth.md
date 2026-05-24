[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / withAuth

# Function: withAuth()

> **withAuth**(`handler`, `policy`): (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/lib/middleware/withAuth.ts:23](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/middleware/withAuth.ts#L23)

Wraps a Next.js App Router route handler with centralized route governance enforcement.
Enforces authentication, RBAC role restrictions, rate limiting, and audit logging.

## Parameters

### handler

`AuthenticatedHandler`

The route handler function.

### policy

[`RoutePolicy`](../interfaces/RoutePolicy.md)

The governance policy containing classification, roles, and rate limit rules.

## Returns

A Next.js compatible route handler that enforces the policy.

(`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

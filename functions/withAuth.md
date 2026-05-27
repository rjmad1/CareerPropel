[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / withAuth

# Function: withAuth()

> **withAuth**(`handler`, `policy`): (`request`, `context`) => `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/lib/middleware/withAuth.ts:23](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/middleware/withAuth.ts#L23)

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

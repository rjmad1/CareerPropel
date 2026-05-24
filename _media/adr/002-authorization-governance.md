# ADR 002: Standardized Centralized Route Governance Layer

## Context and Problem Statement

As CareerPropel scales, different API endpoints adopted disparate mechanisms for handling authentication and authorization (e.g., direct queries via `getServerSession`, manual invocations of `getAuthContext()`, or raw custom JWT decoders). This fragmentation posed significant security-governance risks:
1. **Missed-Auth Vulnerabilities**: Developers could easily forget to call `getAuthContext()` in a new route handler, accidentally exposing data.
2. **Inconsistent Error Responses**: Missing authentication returned disparate schemas (e.g., text plain "Unauthorized" vs custom JSON), breaking front-end parser expectations.
3. **Implicit Framework Magic**: Reliance on complex middleware-level routing rules obscured security perimeters, making auditing extremely difficult.

## Proposed Decision

We introduce a centralized **Route Governance Layer** utilizing a higher-order wrapper `withAuth(handler, policy)`. Every HTTP endpoint handler must be wrapped and declare an explicit `RoutePolicy` object:

```typescript
export interface RoutePolicy {
  classification: 'public' | 'authenticated' | 'privileged' | 'internal';
  roles?: string[];
  rateLimitClass: 'standard' | 'heavy' | 'auth' | 'none';
  auditSensitivity: 'low' | 'medium' | 'high' | 'critical';
  ownershipModel?: 'none' | 'candidate' | 'admin';
}
```

### Key Capabilities
1. **Unified Authentication**: Checks and hydrations are executed in a single, well-tested HOC container (`withAuth`).
2. **Dynamic Ingress Trace Context**: The HOC automatically grabs the request `X-Correlation-ID` header and runs the entire lifecycle (auth, rate limits, audit logs, and handler) in a trace boundary via `AsyncLocalStorage` (`runWithTrace`).
3. **Structured Audit Logs**: Integrated with the application's pino-structured audit logger, ensuring that sensitive routes log critical security events.
4. **CI Policy Enforcement**: An automated coverage scan script (`scripts/security/verify-route-coverage.ts`) runs as a pre-commit or CI check, failing the build if any API route exports raw handlers or lacks registered governance policies.

## Consequences

* **Status**: Approved / Implemented
* **Compliance**: Provides a single source of truth for the system's threat boundary, making auditing extremely straightforward.
* **Deterministic Failures**: Ensures that 100% of security/rate-limit/role violations return a standardized, predictable error schema.
* **Traceability**: Transparently links incoming HTTP requests to background worker logs via a unified correlation ID.

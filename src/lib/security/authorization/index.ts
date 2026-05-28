// Barrel export — import authorization primitives from here
export * from './authorizationService'
export * from './permissionRegistry'
export * from './roleRegistry'
export * from './capabilityResolver'
export { evaluate, evaluateAll, evaluateAny } from './policyEngine'
export type { PolicyContext, PolicyResult } from './policyEngine'
export { invalidateUserCache, invalidateFeatureFlagCache } from './authorizationCache'
export { recordDecision, getAuthorizationMetrics } from './authorizationTelemetry'

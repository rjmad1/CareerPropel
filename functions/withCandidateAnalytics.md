[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / withCandidateAnalytics

# Function: withCandidateAnalytics()

> **withCandidateAnalytics**\<`T`\>(`computeFn`, `routeName`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/lib/route-helpers/analytics.ts:21](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/route-helpers/analytics.ts#L21)

Shared helper for simple analytics GET routes.
Handles authenticate → find candidate → compute → respond,
preserving the same 404 / 500 error format used across all analytics routes.

Usage:
  export async function GET(_req: NextRequest) {
    return withCandidateAnalytics(computeXxx, 'analytics/xxx');
  }

For routes that need request params, pass a closure:
  return withCandidateAnalytics(
    (id) => computeXxx(id, { skipLLM }),
    'analytics/xxx',
  );

## Type Parameters

### T

`T`

## Parameters

### computeFn

(`candidateId`) => `Promise`\<`T`\>

### routeName

`string`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>

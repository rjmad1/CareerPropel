# Testing Strategy

**Last Updated**: 2026-05-21

---

## Test Pyramid

```
        /\
       /E2E\          Cypress — golden path flows
      /------\
     / Integ  \       API route integration tests
    /----------\
   /  Unit Tests \    Domain service, utility functions
  /--------------\
```

### Unit Tests

- **Framework**: Jest + React Testing Library
- **Location**: `src/**/__tests__/` or `*.test.ts` co-located
- **Run**: `npm test`
- **Coverage**: `npm run test:coverage` — target 80% for `src/lib/`

**What to unit test**:
- Domain service functions (`src/lib/db/*.ts`, `src/lib/*/`)
- Utility functions (`src/lib/utils/`)
- Zod validation schemas
- Complex business logic

**What NOT to unit test** (integration handles these):
- API route handlers (test at integration level)
- Database queries (use integration tests with real DB)

### Integration Tests

- **Location**: `src/app/api/**/__tests__/`
- **Pattern**: Test the full API route handler with a test database
- **Required for**: All new API routes

### E2E Tests

- **Framework**: Cypress
- **Location**: `cypress/`
- **Run**: `npm run test:e2e`
- **Covers**: Golden path user flows (register, add job, view dashboard)

---

## Test Naming Convention

```typescript
describe('[ModuleName]', () => {
  describe('[functionName]', () => {
    it('should [expected behavior] when [condition]', () => {
      // ...
    });
  });
});
```

---

## CI Test Gates

| Gate | Command | Failure Action |
|---|---|---|
| Unit tests | `npm test` | Block PR merge |
| Type check | `npm run type-check` | Block PR merge |
| Lint | `npm run lint` | Block PR merge |
| E2E | `npm run test:e2e` | Run on pre-deploy (non-blocking in dev) |
| Coverage | `npm run test:coverage` | Warn if coverage drops >5% |

---

## Test Data Strategy

- Unit tests: in-memory mocks, no external services
- Integration tests: separate test database (`careerpropel_ci`)
- E2E tests: seeded demo data (`npm run demo:seed:small`)
- Never use production data in tests

---

## Regression Test Policy

Every bug fix must include a regression test:

```typescript
// Bad:
it('should work', () => { ... });

// Good:
it('should not throw when candidateId is missing from offer (regression: #123)', () => {
  // Test the specific condition that caused the bug
});
```

---

## AI Feature Testing

AI features must test:
1. Happy path with valid LLM response
2. LLM failure (API error / timeout) → fallback to heuristics
3. LLM returns malformed JSON → Zod parse catches it
4. User input with injection attempt → sanitizer removes it

Mock the Anthropic client in tests:
```typescript
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ content: [{ text: '{}' }] })
    }
  }))
}));
```

# Engineering Standards

Canonical technical standards for CareerPropel development.

---

## Code Quality

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types without documented justification
- All API route handlers explicitly typed
- Zod schemas at every external boundary (user input, external API response)

### Error Handling
- Never swallow errors silently — always log or re-throw
- User-facing error messages: generic (never expose internals)
- Structured logs for all errors: `{ level: 'error', module, message, error, correlationId, userId }`
- HTTP 500 responses contain only `{ error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } }`

### Authentication and Authorization
- Every API route must call `getAuthContext()` or use `withAuth` wrapper
- Every user-scoped resource must verify `resource.candidateId === session.user.id`
- Admin routes must check `session.user.role === 'admin'`
- No route returns another user's data under any condition

### Database
- All DB access goes through `src/lib/db/*.ts` — never direct `prisma.*` calls in route handlers
- Migrations are always additive-first; destructive changes require ADR
- New indexes justified by query analysis
- No raw SQL unless Prisma cannot express the query (document why)

---

## Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Files | `camelCase.ts` | `jobService.ts` |
| React components | `PascalCase.tsx` | `JobCard.tsx` |
| API routes | `route.ts` in Next.js directory | `src/app/api/jobs/route.ts` |
| DB layer | `src/lib/db/[domain].ts` | `src/lib/db/jobs.ts` |
| Types | `src/types/[domain].ts` | `src/types/job.ts` |
| Specs | `kebab-case.md` in `specs/active/` | `specs/active/calendar-sync.md` |
| ADRs | `NNN-kebab-case.md` | `docs/adr/003-redis-session-caching.md` |

---

## API Design

- RESTful resource naming (nouns, plural): `/api/jobs`, `/api/interviews`
- HTTP verbs: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE (remove)
- Response shape: `{ data: T }` for success, `{ error: { code, message } }` for failures
- Pagination: `{ data: T[], pagination: { page, limit, total } }`
- Never expose database IDs directly — use CUIDs (Prisma default)

---

## Logging

Use `src/lib/logging/logger.ts` (pino). Never use `console.log` in production code.

```typescript
logger.info({ module: 'jobs', action: 'create', jobId, userId, correlationId }, 'Job created');
logger.error({ module: 'jobs', error, jobId, correlationId }, 'Failed to create job');
```

Required fields in every log:
- `module`: source module name
- `correlationId`: from request context (`src/lib/logging/traceContext.ts`)
- `userId`: when available

Never log: passwords, tokens, API keys, full PII fields (email ok, SSN/credit card never).

---

## Testing

- Unit tests: `src/**/__tests__/` or `src/**/*.test.ts`
- Integration tests: `src/app/api/**/__tests__/`
- E2E: `cypress/`
- Coverage target: 80% for new code in `src/lib/`
- Every bug fix must include a regression test

Test naming: `describe('[Module]', () => { it('should [behavior] when [condition]') })`

---

## Security Defaults

- `npm audit` must pass at `--audit-level=high` in CI
- No secrets in code — use `.env.local` / Vercel env vars
- Rate limiting applied to all unauthenticated and state-changing routes
- Input sanitized with Zod at every API boundary
- DOMPurify on any HTML rendered from user or AI content
- HTTP security headers set in `next.config.js` (X-Frame-Options, CSP, etc.)

---

## Documentation Standards

- Every public function in `src/lib/` should have a one-line JSDoc for non-obvious behavior
- Complex algorithms or workarounds must have an inline comment explaining WHY
- User-visible feature changes must update `docs/` or `specs/`
- Root-level MD files are for project-wide concerns only — feature docs belong in `docs/`

# Coding Standards

This document establishes the canonical coding standards, naming conventions, and security policies for development in the CareerPropel codebase.

---

## 1. Code Quality & Language Standards

### TypeScript
- Strict mode is enabled (`"strict": true` in `tsconfig.json`).
- Use of the `any` type is prohibited without documented justification.
- All API route handlers must be explicitly typed.
- Define Zod schemas at every external boundary (user input, external API responses).

### Error Handling
- Never swallow errors silently. Always log them or re-throw.
- Do not expose internals in user-facing errors.
- Structured log format for errors: `{ level: 'error', module, message, error, correlationId, userId }`.
- HTTP 500 responses must be returned as `{ error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } }`.

### Authentication and Authorization
- All API routes must call `getAuthContext()` or use the `withAuth` wrapper.
- All user-scoped resources must verify `resource.candidateId === session.user.id`.
- Admin routes must check `session.user.role === 'admin'`.

### Database Access
- All database queries must go through repository classes in `src/lib/db/` — direct `prisma.*` queries in API route handlers are prohibited.
- Migrations must be additive-first. Destructive changes require an Architecture Decision Record (ADR).
- No raw SQL is permitted unless Prisma cannot express the query (documented in code).

---

## 2. Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Source Files | `camelCase.ts` | `jobService.ts` |
| UI Components | `PascalCase.tsx` | `JobCard.tsx` |
| API Routes | Next.js App Router folders | `src/app/api/jobs/route.ts` |
| DB Layer Reps | `src/lib/db/[domain].ts` | `src/lib/db/jobs.ts` |
| Types | `src/types/[domain].ts` | `src/types/job.ts` |
| Specs | `kebab-case.md` in `specs/active/` | `specs/active/calendar-sync.md` |
| ADRs | `NNN-kebab-case.md` in `docs/adr/` | `docs/adr/001-scraping-isolation.md` |

---

## 3. API Design

- **Restful Resource Naming**: Nouns in plural (e.g., `/api/jobs`, `/api/interviews`).
- **HTTP Verbs**:
  - `GET` - Read
  - `POST` - Create
  - `PUT` - Full update
  - `PATCH` - Partial update
  - `DELETE` - Remove
- **Response Shape**:
  - Success: `{ data: T }`
  - Failure: `{ error: { code, message } }`
  - Paginated: `{ data: T[], pagination: { page, limit, total } }`
- **Database Keys**: Do not expose auto-increment database IDs; use CUIDs.

---

## 4. Logging & Telemetry

Use `src/lib/logging/logger.ts` (pino wrapper). Never use `console.log` in production.

```typescript
logger.info({ module: 'jobs', action: 'create', jobId, userId, correlationId }, 'Job created');
```

- **Required Fields**: `module` (source module name), `correlationId` (from request context), `userId` (when available).
- **Prohibited Logs**: Raw passwords, API keys, tokens, or full PII fields (except email).

---

## 5. Testing Targets

- **Unit/Integration Tests**: Placed in `src/**/__tests__/` or named `*.test.ts`.
- **E2E Tests**: Placed under `cypress/` or using Playwright.
- **Coverage Target**: Minimum 80% line coverage for new code in `src/lib/`.
- **Regression Tests**: Every bug fix must include a regression test.

---

## 6. Security Defaults

- `npm audit` must pass at `--audit-level=high` in CI.
- Store secrets only in `.env.local` or environment variables; never hardcode secrets.
- Input must be sanitized with Zod schemas.
- Render user or AI content via `DOMPurify` to prevent XSS.
- Rate limiting is enforced on all unauthenticated and state-changing routes.

---

## 7. AI & Prompt Governance

- Prompts must live in `src/lib/agents/prompts.ts` or adjacent `*prompts.ts` files.
- Sanitize user input in prompts using `promptSanitizer.ts`.
- Prohibit inclusion of email addresses, phone numbers, or dates of birth in prompts.
- All AI features must implement a non-AI fallback path.

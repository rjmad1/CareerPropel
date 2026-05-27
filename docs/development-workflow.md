# Development Workflow

## Purpose

Day-to-day engineering practices for CareerPropel contributors.

## Branch Strategy

- `main` — production-ready, protected
- Feature branches: `feat/<ticket>-description`
- Fix branches: `fix/<ticket>-description`

## Making Changes

### Database Schema Changes

1. Edit `prisma/schema.prisma`
2. `npm run db:migrate` — creates migration SQL and applies it
3. Commit the generated migration file in `prisma/migrations/`
4. Update affected `src/lib/db/` repository functions

### Adding a New API Route

1. Create `src/app/api/<resource>/route.ts`
2. Use `getCurrentUser` or `requireAuth` for protected routes
3. Use `ApiErrors.*` for standard error responses
4. Add Zod validation for request bodies
5. Update [repository-map.md](repository-map.md)

### Adding a New Agent Type

1. Add type to `AgentType` union in `src/lib/agents/prompts.ts`
2. Add system prompt and user prompt template to `prompts.ts`
3. Add policy in `src/lib/governance/policyEngine.ts` (`AGENT_POLICIES`)
4. Add Zod output schema in `src/lib/governance/outputValidator.ts`
5. Add semantic validation rules in `outputValidator.ts`
6. Update `validAgentTypes` array in `src/app/api/agents/execute/route.ts`
7. Add to [Agent Types concept doc](../wiki/concepts/agent-types.md)

### Adding Governance Controls

- **New policy field**: extend `AgentPolicy` in `policyEngine.ts`
- **New hallucination pattern**: add to `hallucinationControls.ts` pattern arrays
- **New validation layer**: extend `validateAgentOutput` in `outputValidator.ts`

### Frontend Components

- Components live under `src/components/<Domain>/`
- Use React Query (`@tanstack/react-query`) for data fetching
- Use Zustand stores in `src/hooks/` for client state
- SSE subscriptions via `useAgentRealTime` hook

## Testing

```bash
npm run test            # Unit tests (Jest)
npm run test:watch      # Watch mode
npm run test:e2e        # E2E (Playwright)
```

- Unit tests: colocated with source or in `__tests__/`
- E2E tests: `cypress/e2e/`

## Code Quality

```bash
npm run lint            # ESLint — must pass before PR
npm run type-check      # tsc --noEmit — must pass
npm run format          # Prettier format
```

## Environment Variables

Never commit `.env.local`. Add new variables to `.env.local.example` with a placeholder value and document them in [getting-started.md](getting-started.md).

## Migrations

- Always commit migration files
- Never hand-edit migration SQL after running — create a new migration
- Migration naming: `YYYYMMDDHHMMSS_description`

## Observability During Development

- Pino logs output to stdout in JSON format
- Use `LOG_LEVEL=debug` for verbose output
- Ops dashboard: `GET /api/ops/metrics`, `GET /api/ops/queue`
- Provider health: `GET /api/ops/providers`

## Related

- [Getting Started](getting-started.md)
- [Agent System](../wiki/components/agent-system.md)
- [Governance Layer](../wiki/components/governance.md)

## Last Updated
2026-05-27

# Contributing to CareerPropel

This guide covers the spec-driven development workflow for CareerPropel.

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/rjmad1/CareerPropel.git
cd CareerPropel
npm install

# 2. Set up local environment
cp .env.local.example .env.local
# Edit .env.local with your values (see docs/development/SETUP_GUIDE.md)

# 3. Set up database
# CREATE ROLE career_user WITH LOGIN PASSWORD 'career_pass';
# CREATE DATABASE career_propel_dev OWNER career_user;
npx prisma migrate deploy
npx prisma generate

# 4. Start dev server
npm run dev
```

---

## Development Workflow

CareerPropel uses a **spec-driven engineering** model. See `docs/governance/SPEC_WORKFLOW.md` for
the complete workflow.

### Short version:

1. **Spec first** — for Medium+ features, create a spec in `specs/active/` before writing code
2. **Branch** — branch from `main`, use conventional commit naming: `feat/`, `fix/`, `chore/`
3. **Implement** — follow `docs/governance/ENGINEERING_STANDARDS.md`
4. **Validate** — run `npm run type-check && npm run lint && npm test`
5. **PR** — complete the PR template, link your spec, verify CI passes

---

## Spec Requirements by Complexity

| Tier | Criteria | Required Before PR |
|---|---|---|
| Trivial | Bug fix, config, docs | Nothing extra |
| Small | < 1 day, no schema change | Good PR description |
| Medium | 1-3 days, API or UI change | Product spec (`specs/active/`) |
| Large | 3+ days, new DB model | Product spec + Technical design |
| Architectural | Auth / infra / schema boundary | ADR + Technical design |

Templates in `templates/` — start from there.

---

## CI Requirements

All PRs must pass:
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript strict mode
- `npm test` — unit tests
- `npm audit --audit-level=high` — no high/critical CVEs
- Spec governance check — schema changes require ADR reference in PR body

---

## Commit Convention

[Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add calendar sync integration
fix: correct ownership check in interview-prep route
chore: update Prisma to v5.1
docs: add ADR for Redis session caching
```

---

## Architecture Reference

- `docs/architecture/AGENT_SYSTEM.md` — AI agent architecture
- `docs/adr/` — architectural decision records
- `docs/governance/ENGINEERING_STANDARDS.md` — coding standards
- `docs/governance/AI_GOVERNANCE.md` — LLM governance
- `docs/security/THREAT_MODEL.md` — security model

---

## AI-Assisted Development

See `docs/development/AI_WORKFLOW.md` for how to use Claude, Cursor, or Copilot effectively
with the spec-driven workflow.

---

## Getting Help

- Open a GitHub Issue using one of the issue templates
- For security issues: use GitHub Security Advisories (private)

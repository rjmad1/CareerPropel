# Spec-Driven Engineering Workflow

This document defines the canonical spec-driven development workflow for CareerPropel. All feature
development follows the **Spec → Plan → Tasks → Implement → Validate → Deploy** cycle.

---

## Why Spec-Driven?

CareerPropel is an AI-assisted platform with complex domain logic, privacy requirements, and production
infrastructure. Spec-driven engineering ensures:

- **Alignment before code** — requirements are explicit before implementation begins
- **Governance trail** — architectural decisions are documented and reviewable
- **Operational safety** — deployment readiness is verified before production
- **AI collaboration** — deterministic handoff structure between human intent and AI implementation

---

## Complexity Tiers

| Tier | Criteria | Required Artifacts |
|---|---|---|
| **Trivial** | Bug fix, copy change, config tweak | None |
| **Small** | < 1 day, single file, no schema change | None (PR description sufficient) |
| **Medium** | 1-3 days, API or UI change, no new models | Product Spec |
| **Large** | 3+ days, multi-domain, or new DB model | Product Spec + Technical Design Spec |
| **Architectural** | New service boundary, auth change, infra change | ADR + Technical Design + OR Review |

---

## The Workflow

### Step 1: Spec

**Who**: Feature owner (you or AI assistant)  
**When**: Before writing any implementation code

Choose the appropriate template(s) from `templates/`:
- `templates/spec-product.md` → Create at `specs/active/<feature-slug>.md`
- `templates/spec-technical-design.md` → Create at `docs/specifications/tech-<feature-slug>.md`
- `templates/adr.md` → Create at `docs/adr/NNN-<decision-slug>.md`

The spec must answer:
- What problem does this solve?
- What does success look like?
- What are the risks and constraints?
- What is out of scope?

### Step 2: Plan

**Who**: Implementer (you or AI assistant)  
**Input**: Approved spec

Break the spec into implementation tasks. For AI-assisted development:

```
CONTEXT: [Paste spec content]
TASK: [Specific subtask from spec]
CONSTRAINTS: [From spec constraints section]
OUTPUT: [Expected deliverable]
```

### Step 3: Implement

**Who**: Developer / AI assistant  
**Constraints**:
- Implement only what the spec defines
- Validate against acceptance criteria
- Link spec in PR description

### Step 4: Validate

Before opening a PR:

```bash
npm run type-check     # TypeScript errors
npm run lint           # ESLint
npm test               # Unit tests
npm run security:audit # Dependency audit
```

### Step 5: PR Governance

Open PR with:
- Spec file path(s) in description
- Completed PR template checklist
- Screenshots / evidence for UI changes

CI will run `scripts/governance/spec-check.js` and fail if:
- `prisma/schema.prisma` changed without ADR reference
- (Other governance rules — see spec-check.js for details)

### Step 6: Operational Readiness (for production deployments)

For Large or Architectural changes, complete `templates/operational-readiness.md` and store at
`docs/operational-readiness/<feature-slug>-OR.md`.

---

## Spec Lifecycle

```
specs/active/       ← In-progress or approved, not yet implemented
specs/archived/     ← Implemented, superseded, or abandoned
docs/specifications/ ← Stable reference specs (API contracts, technical designs)
docs/adr/           ← Immutable decision records (never deleted, only superseded)
```

Specs move from `specs/active/` to `specs/archived/` when the feature ships.

---

## AI-Assisted Development Guidelines

### Prompt Hygiene

When delegating implementation to an AI assistant:

1. **Always provide the spec** as context — never describe requirements verbally without a written spec
2. **Constrain scope explicitly** — reference the "Out of Scope" section
3. **Include relevant domain context**: schema, existing service, type definitions
4. **Request verification**: ask the AI to validate against acceptance criteria

### Context Preservation

Between AI sessions, include:
- Link to the active spec
- Summary of decisions made in previous sessions
- Current status of acceptance criteria

### Change Isolation

- One spec → one PR (no bundled unrelated changes)
- If scope grows, create a follow-up spec rather than expanding the current PR
- Breaking changes always require their own PR

---

## Governance Gates

| Gate | Trigger | Who Reviews |
|---|---|---|
| Spec review | Medium+ features | Feature owner |
| ADR review | Architectural decisions | @rjmad1 |
| Security review | Auth, data, AI changes | @rjmad1 |
| OR review | Production deployments | Feature owner |
| CI pass | All PRs | Automated |

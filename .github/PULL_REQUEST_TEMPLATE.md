## Summary

<!-- One paragraph: what changed and why. -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Refactor / tech-debt
- [ ] Docs / config only
- [ ] Security / compliance

## Spec Linkage

<!-- Every feature or architectural change MUST link a spec. Bug fixes and docs PRs are exempt. -->

| Type | Link |
|---|---|
| Product Spec | `specs/active/` or N/A |
| Technical Design | `docs/specifications/` or N/A |
| ADR | `docs/adr/` or N/A |
| API Contract | `docs/specifications/api/` or N/A |

## Architectural Impact

- [ ] Schema change (`prisma/schema.prisma`) → ADR required
- [ ] New API route(s) → API contract spec required
- [ ] Auth / security boundary change → Security review required
- [ ] AI/LLM prompt change → AI governance spec required
- [ ] Infrastructure / middleware change → Operational readiness check required
- [ ] None of the above

## Pre-merge Checklist

### Code Quality
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Unit tests pass (`npm test`)
- [ ] No new `any` types introduced without justification

### Spec Compliance
- [ ] Linked spec/ADR exists and is complete **or** this change is exempt (bug/docs/config)
- [ ] Spec reflects the actual implementation (not aspirational)
- [ ] Breaking changes documented in spec

### Security
- [ ] No secrets committed or logged
- [ ] User input validated at API boundary
- [ ] Auth/RBAC checked for new routes
- [ ] `npm audit` clean or exceptions justified

### Operational Readiness
- [ ] Error states are logged with structured context
- [ ] New environment variables documented in `.env.example`
- [ ] Migrations are reversible or rollback strategy documented
- [ ] Feature can be disabled without a deploy (flag/env) if risky

## Test Plan

<!-- Describe what you tested manually and/or automated. -->

## Rollback Strategy

<!-- How to revert if this causes production issues. -->

## Screenshots / Evidence

<!-- UI changes: before/after screenshots. API changes: curl example. -->

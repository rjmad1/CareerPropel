# Specs

This directory contains active and archived product and feature specifications for CareerPropel.

## Directory Structure

```
specs/
  active/       ← Specs in progress or approved-but-not-yet-shipped
  archived/     ← Shipped, superseded, or abandoned specs
  README.md     ← This file
```

## Creating a New Spec

1. Copy `templates/spec-product.md` into `specs/active/<feature-slug>.md`
2. Fill in all required sections (Problem Statement, Success Metrics, Acceptance Criteria)
3. Open a PR with the spec file before starting implementation
4. After the feature ships, move the spec to `specs/archived/`

For Large or Architectural features, also create a Technical Design Spec at
`docs/specifications/tech-<feature-slug>.md` using `templates/spec-technical-design.md`.

## Spec Lifecycle

```
[GitHub Issue: Feature Request] 
    ↓
[specs/active/<slug>.md — Draft]
    ↓
[PR Review — spec approved]
    ↓
[Implementation PR — links this spec]
    ↓
[Shipped] → [specs/archived/<slug>.md]
```

## Tier Requirements

| Complexity | Required Spec |
|---|---|
| Trivial / Small | None — PR description sufficient |
| Medium (1-3 days) | Product spec in `specs/active/` |
| Large (3+ days) | Product spec + Technical design in `docs/specifications/` |
| Architectural | ADR in `docs/adr/` + Technical design |

See `docs/governance/SPEC_WORKFLOW.md` for the complete workflow.

## Active Specs

<!-- Add links here as specs are created -->
*(None yet — this is the starting state)*

## Recently Archived

<!-- Add links here as features ship -->
*(None yet)*

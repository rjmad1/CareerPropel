# ADR 003: Adopt Spec-Driven Engineering Workflow

**Status**: Accepted  
**Date**: 2026-05-21  
**Authors**: Platform Engineering

---

## Context and Problem Statement

CareerPropel has accumulated 25+ root-level documentation files, no PR or issue templates, a single
CI workflow (Lighthouse only), and no formal process connecting features to their documentation
before implementation. This has created:

1. **Documentation sprawl** — status reports, WEEK5_, PHASE_ files scattered at root
2. **No spec baseline** — features implemented without documented requirements or acceptance criteria
3. **No governance trail** — architectural decisions not consistently recorded (only 2 ADRs exist)
4. **Weak CI enforcement** — no lint, type-check, or test gates in CI

As the platform grows toward production readiness, the absence of structured workflow creates
operational risk: insufficient observability planning, missing rollback strategies, and no audit
trail for AI-related decisions.

## Decision Drivers

- Platform must be maintainable beyond initial development
- AI-generated code requires deterministic spec inputs for reliable output
- Security and compliance requirements demand documented governance
- Operational safety requires pre-deploy readiness verification

## Considered Options

### Option A: Lightweight process (checklists only)

Simple PR template checklist. No enforced structure.

**Pros**: Fast to adopt, minimal friction  
**Cons**: No formal spec artifacts, governance decays over time

### Option B: Full Spec-Driven Engineering Kit (selected)

GitHub-native spec kit with templates, enforcement scripts, structured CI gates, and formal spec
lifecycle (`specs/active/` → `specs/archived/`).

**Pros**: Durable governance, AI-collaboration optimized, operational rigor  
**Cons**: More upfront structure to create; must be maintained

### Option C: External spec management tool (Linear, Notion)

Manage specs in an external tool and link via IDs.

**Pros**: Rich UI, good for teams  
**Cons**: Creates external dependency, link rot, diverges from repo-as-source-of-truth

## Decision

**Option B** — GitHub-native Spec Kit, implemented directly in the repository.

Rationale: The repository is the source of truth for all CareerPropel engineering artifacts.
External tools create fragmentation and link rot. A GitHub-native kit ensures specs are version-
controlled, co-evolve with code, and are accessible during AI-assisted development sessions without
context-switching.

## Consequences

### Positive
- Architectural decisions have a permanent, discoverable record
- PRs are self-documenting: spec link → implementation → test → review
- CI enforces governance gates automatically
- AI sessions can reference specs directly for deterministic implementation

### Negative / Accepted Tradeoffs
- Spec creation adds 15-30 minutes per Medium+ feature
- Existing features do not have retroactive specs (backfill is optional)
- Governance scripts must be maintained as codebase evolves

### Neutral
- Existing root-level MD files are not deleted — they are referenced from the new docs/ structure
- Templates are in `templates/` — not enforced, but referenced from issue templates and CONTRIBUTING

## Operational Implications

- **CI impact**: New `ci.yml` adds lint, type-check, unit test, and spec-check jobs
- **PR workflow**: All PRs now require PR template completion
- **Spec lifecycle**: `specs/active/` must be pruned as features ship

## Reversal / Migration Path

The spec kit is additive (templates, docs, CI workflows). Reverting is as simple as deleting the
`.github/` additions and `templates/` directory. No code changes required.

# AI-Assisted Development Workflow

This document describes how to collaborate effectively with AI assistants (Claude, Cursor, Copilot)
on CareerPropel using the spec-driven engineering model.

---

## Core Principle

**Spec-first, then delegate.** AI assistants produce their best output when given explicit,
structured context from a spec — not verbal descriptions. A good spec eliminates ambiguity,
constrains scope, and produces deterministic implementation.

---

## The Handoff Protocol

### 1. Write the Spec First

Before starting any AI session, create the spec:
- `specs/active/<feature-slug>.md` for the product requirements
- `docs/specifications/tech-<feature-slug>.md` for the technical design (Large features)

### 2. Structure Your AI Prompt

Use this template for AI implementation sessions:

```
## Context
[Paste the relevant spec section(s)]

## Current Code
[Paste or reference the relevant existing files]

## Task
[One specific, bounded task from the spec's implementation checklist]

## Constraints
- [From spec: constraints section]
- Do not modify files outside the listed scope
- Follow existing patterns in [reference file]
- All new routes must use withAuth / getAuthContext

## Output
[What specific artifact should the AI produce]
```

### 3. Validate Against Spec

After receiving implementation from AI:
- Check against spec's Acceptance Criteria section
- Run `npm run type-check` and `npm run lint`
- Run relevant tests
- If the output deviates from spec, correct the spec OR the implementation — not both silently

---

## Context Preservation Between Sessions

AI assistants have no memory between sessions. Use this structure:

**Session start prompt:**
```
Continuing work on [feature-slug]. Spec: [paste spec or link].
Previous session status: [list completed acceptance criteria].
Current task: [next uncompleted task from checklist].
```

---

## Change Isolation

- **One spec → one PR** — do not bundle unrelated changes
- If scope creeps, document the new scope as a follow-up spec, not by expanding the current PR
- If the AI proposes a change outside the spec scope, reject it and create a new issue

---

## Effective Prompt Patterns

### Finding the right place to make a change

```
In the CareerPropel codebase, I need to [action]. 
The relevant domain is [domain name in src/domains/ or src/lib/].
The data model is [paste relevant Prisma model].
Show me the correct file and function to modify.
```

### Adding a new API route

```
Create a new Next.js App Router API route at src/app/api/[resource]/route.ts following 
the existing pattern in src/app/api/jobs/route.ts.

Requirements from spec:
[paste API contract from spec or templates/api-contract.md]

Auth: use getAuthContext() pattern from src/lib/middleware/withAuth.ts
DB: use src/lib/db/[domain].ts pattern
Response: use src/lib/utils/apiResponse.ts
```

### Debugging an error

```
Error: [paste full error message and stack trace]
File: [file path:line number]
Context: [what you were doing when the error occurred]
Relevant code: [paste the function]
What I've already tried: [list attempts]
```

---

## Prompt Hygiene Rules

1. **Never paste secrets** into AI prompts (API keys, passwords, .env content)
2. **Be explicit about scope** — "only modify X file" prevents unintended changes
3. **Request explanations for non-obvious choices** — ask "why did you choose this approach?"
4. **Verify security-critical changes independently** — don't trust AI for auth logic without review
5. **One task per session** — long multi-task sessions produce lower quality output

---

## AI-Generated Code Review Checklist

Before merging AI-generated code:

- [ ] Does it exactly match the spec's acceptance criteria?
- [ ] Does it follow the naming conventions in `docs/governance/ENGINEERING_STANDARDS.md`?
- [ ] Are all routes authenticated and ownership-checked?
- [ ] Is user input validated with Zod at the boundary?
- [ ] Are errors logged with structured context (not `console.log`)?
- [ ] Are there any `any` types that need explicit justification?
- [ ] Does it handle failure modes (DB unavailable, external API timeout)?

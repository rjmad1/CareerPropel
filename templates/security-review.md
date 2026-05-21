# Security Review: [Feature / Change Name]

**Status**: Draft | Reviewed | Approved  
**Feature/Spec**: [Link to product or technical spec]  
**Reviewer**: [Name]  
**Date**: YYYY-MM-DD  
**Severity**: Critical | High | Medium | Low

---

## Scope

<!-- What is being reviewed? List specific files, routes, or components. -->

**Files in scope**:
- `src/[path]/[file].ts`

**Routes in scope**:
- `[METHOD] /api/[route]`

## Threat Model

### Assets
<!-- What valuable assets (data, capabilities, credentials) are at risk? -->

| Asset | Classification | Location |
|---|---|---|
| User credentials | Critical | `Candidate.passwordHash` |
| API keys | Critical | `ApiKey` table (encrypted) |
| Personal data (PII) | High | `Candidate.*` |
| Session tokens | High | NextAuth cookies |

### Threat Actors
- [ ] Unauthenticated external attacker
- [ ] Authenticated malicious user (IDOR, privilege escalation)
- [ ] Compromised third-party dependency
- [ ] Insider (developer / operator error)

### Attack Vectors

| Vector | Risk | Mitigation |
|---|---|---|
| SQL/ORM injection | [High/Med/Low] | Prisma parameterized queries |
| Prompt injection | [High/Med/Low] | `promptSanitizer.ts` + delimiters |
| XSS | [High/Med/Low] | DOMPurify + React auto-escaping |
| CSRF | [High/Med/Low] | NextAuth CSRF token |
| IDOR (Insecure Direct Object Reference) | [High/Med/Low] | `resource.candidateId === session.user.id` check |
| Brute force | [High/Med/Low] | Rate limiting (`rateLimiter.ts`) |
| Secrets exposure | [High/Med/Low] | Env vars, no logging |

## Dependency Risks

<!-- Review new or updated dependencies for known CVEs and supply chain risk. -->

| Package | Version | Purpose | CVE Check | Notes |
|---|---|---|---|---|
| [package] | [version] | [use] | Clean / [CVE-XXXX] | [Notes] |

## Secrets Management

- [ ] No secrets hardcoded or in code
- [ ] Secrets in `.env.local` / Vercel env — not committed
- [ ] `.gitignore` covers all `.env*` files
- [ ] API keys encrypted at rest (`tokenEncryption.ts`)
- [ ] Secrets masked in logs

## Access Boundaries

<!-- Map who can access what. -->

| Resource | Authenticated | Owner Only | Admin Only |
|---|---|---|---|
| `GET /api/jobs` | Yes | Yes | No |
| `GET /api/admin/*` | Yes | No | Yes |

## Data Retention

- **Retention period**: [How long is this data kept?]
- **Deletion mechanism**: [Cascade delete / soft delete / scheduled purge]
- **Right to erasure**: [Does `DELETE /api/account` cover this data?]

## Abuse Prevention

- [ ] Rate limiting applied to sensitive endpoints
- [ ] Account enumeration prevented (consistent error messages)
- [ ] File upload size limits enforced
- [ ] MIME type validation for file uploads
- [ ] Threat detection hooks in `threatDetection.ts`

## Pre-Merge Security Checklist

- [ ] All new routes have auth check (`withAuth` or `getAuthContext`)
- [ ] All new routes have ownership check for user-scoped data
- [ ] All user inputs validated with Zod schema at boundary
- [ ] No sensitive data in error messages returned to client
- [ ] No new `console.log` with user data (use structured pino)
- [ ] `npm audit` shows no new high/critical vulnerabilities
- [ ] Security headers (`next.config.js`) unmodified or reviewed

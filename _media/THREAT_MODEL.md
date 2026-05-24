# CareerPropel Threat Model

**Last Updated**: 2026-05-21  
**Classification**: Internal  
**Owner**: Platform Security

---

## System Overview

CareerPropel is a Next.js web application handling sensitive career and personal data. The primary
attack surface includes:

- Authentication flows (login, registration, password reset)
- Job and profile data APIs (CRUD with ownership enforcement)
- AI/LLM pipeline (prompt injection, PII exposure)
- File handling (resume uploads, avatar uploads)
- External integrations (LinkedIn scraping, job board scraping)
- WebSocket / real-time connections (Socket.IO)

---

## Asset Classification

| Asset | Classification | Location | Consequence if Compromised |
|---|---|---|---|
| User credentials (hashed) | Critical | `Candidate.passwordHash` | Account takeover |
| Session tokens | Critical | NextAuth cookies (HttpOnly) | Session hijack |
| API keys (user-supplied) | Critical | `ApiKey` table (AES-256 encrypted) | Third-party API abuse |
| `AI_MASTER_SECRET` | Critical | Vercel env var | Decrypt all API keys |
| `NEXTAUTH_SECRET` | Critical | Vercel env var | Forge session tokens |
| Personal data (PII) | High | `Candidate.*` fields | Privacy violation, regulatory |
| Job applications | Medium | `Job.*` | Competitive intelligence |
| AI-generated content | Low | Interview prep, narratives | Quality degradation |

---

## Threat Actors

| Actor | Capability | Motivation |
|---|---|---|
| Unauthenticated external | Web requests | Data exfiltration, account takeover |
| Authenticated malicious user | Valid session | IDOR, data theft, abuse of AI features |
| Compromised dependency | npm supply chain | Code execution, secret theft |
| Insider (dev error) | Full access | Accidental exposure |

---

## Threat Register

### T-001: IDOR (Insecure Direct Object Reference)

**Risk**: High  
**Vector**: Authenticated user accesses another user's resources by manipulating IDs  
**Mitigation**: Every resource query verifies `candidateId === session.user.id`  
**Status**: Mitigated (verified in `src/lib/db/*.ts` ownership checks)

---

### T-002: Authentication Bypass

**Risk**: Critical  
**Vector**: API routes accessible without valid session  
**Mitigation**: `src/middleware.ts` redirects unauthenticated page requests; API routes use `getAuthContext()` returning 401  
**Status**: Mitigated (middleware split: pages redirect, API routes return 401 JSON)

---

### T-003: Prompt Injection

**Risk**: High  
**Vector**: Malicious user input embedded in AI prompts, causing model to ignore instructions  
**Mitigation**: `src/lib/safety/promptSanitizer.ts` + explicit delimiters around user content  
**Status**: Partially mitigated — requires ongoing testing with adversarial inputs

---

### T-004: Brute Force / Credential Stuffing

**Risk**: High  
**Vector**: Automated login attempts against `/api/auth/register` and credentials endpoint  
**Mitigation**: `src/lib/middleware/rateLimiter.ts` (Redis-backed); fail-open risk documented as DEBT-002  
**Status**: Mitigated with known debt (see risk registry)

---

### T-005: Secret Exposure via Logs

**Risk**: High  
**Vector**: API keys, tokens, or PII accidentally logged  
**Mitigation**: `src/lib/logging/logger.ts` structured pino; code review policy; no `console.log` in production  
**Status**: Process mitigation; no automated secret scanning in logs

---

### T-006: XSS via AI-Generated Content

**Risk**: Medium  
**Vector**: LLM returns HTML/JS content rendered in browser without sanitization  
**Mitigation**: `dompurify` applied to all AI-generated HTML content  
**Status**: Mitigated

---

### T-007: Supply Chain Compromise

**Risk**: Medium  
**Vector**: Malicious package update in npm dependency tree  
**Mitigation**: `npm audit` in CI; `dependency-review.yml` on PRs; `package-lock.json` committed  
**Status**: Detection mitigated; prevention is industry-wide challenge

---

### T-008: Symmetric Key Compromise (DEBT-003)

**Risk**: High  
**Vector**: `AI_MASTER_SECRET` leaked → all user API keys decryptable  
**Mitigation**: IAM restrictions on env vars; key rotation procedure  
**Status**: Governed debt — migration to KMS planned (see risk registry)

---

## Security Controls Summary

| Control | Implementation | Coverage |
|---|---|---|
| Authentication | NextAuth + credentials | All pages and API routes |
| Authorization | `withAuth` + ownership check | All user-scoped API routes |
| Input validation | Zod schemas | All API route handlers |
| Output sanitization | DOMPurify | AI content rendering |
| Rate limiting | Redis token bucket | Auth routes, AI routes |
| Prompt safety | `promptSanitizer.ts` + delimiters | All LLM prompts |
| Secret encryption | AES-256-CBC | User API keys |
| Dependency scanning | `npm audit` + GitHub dependency review | CI/CD |
| Security headers | `next.config.js` | All HTTP responses |
| CSRF | NextAuth built-in | Form submissions |

---

## Known Gaps (Open Risks)

| Gap | Severity | Tracked In |
|---|---|---|
| Symmetric master key (DEBT-003) | High | risk-registry.md |
| Rate limit fail-open (DEBT-002) | Medium | risk-registry.md |
| No automated PII detection in logs | Medium | Untracked — should add |
| No Content-Security-Policy (CSP) header | Medium | Untracked — should add |

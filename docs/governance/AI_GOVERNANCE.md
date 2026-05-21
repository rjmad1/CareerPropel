# AI Governance Framework

CareerPropel is AI-assisted at its core. This document defines the governance model for all
AI/LLM-powered features, prompt management, cost governance, and safety boundaries.

---

## Principles

1. **Transparency**: Users know when AI is generating content (not presented as authoritative facts)
2. **Minimal data**: AI receives only data necessary for the specific task
3. **Deterministic fallback**: Every AI feature has a non-AI fallback path
4. **Cost-bounded**: Per-call token limits and per-user rate limits enforced
5. **Safety-first**: Prompt injection mitigated; outputs validated before use

---

## Model Routing Policy

| Use Case | Model | Rationale |
|---|---|---|
| Interview prep generation | `claude-sonnet-4-6` | Quality required, used infrequently |
| ATS resume analysis | `claude-sonnet-4-6` | Accuracy critical |
| Career narrative generation | `claude-sonnet-4-6` | Quality required |
| Mock interview feedback | `claude-sonnet-4-6` | Nuance required |
| Simple classification tasks | `claude-haiku-4-5` | Cost optimization |

**Fallback chain**: Claude API → Heuristic/rule-based implementation → Graceful error to user

---

## Prompt Registry

All production prompts live in `src/lib/agents/prompts.ts` or adjacent `*prompts.ts` files.
Changes to prompts require:
1. Spec update if behavior changes meaningfully
2. AI Governance Spec if new PII fields or new attack surface
3. Testing with adversarial inputs before deploy

---

## PII in Prompts

**Allowed PII fields in prompts** (minimum necessary):
- Candidate name (for personalization)
- Job title and company (for relevance)
- Skills list (non-sensitive)
- Work history summary (non-sensitive)

**Prohibited in prompts**:
- Email addresses
- Phone numbers
- Date of birth
- Salary specifics unless directly relevant to the task

All user-supplied text must be wrapped in explicit delimiters and sanitized via
`src/lib/safety/promptSanitizer.ts` before inclusion in any prompt.

---

## Token Cost Governance

| Feature | Model | Max Tokens | Estimated Cost/Call | Rate Limit |
|---|---|---|---|---|
| Interview prep | Sonnet | 8,000 | ~$0.024 | 10/day/user |
| ATS check | Sonnet | 4,000 | ~$0.012 | 20/day/user |
| Career narrative | Sonnet | 4,000 | ~$0.012 | 5/day/user |
| Mock feedback | Sonnet | 2,000 | ~$0.006 | 50/day/user |

Platform-level alert: If total daily spend exceeds $50, alert via structured log at `level: warn`.

---

## BYOK (Bring Your Own Key)

Users may supply their own Anthropic API key in Settings → AI Providers.

Governance rules:
- User key stored encrypted: `src/lib/crypto/tokenEncryption.ts` (AES-256-CBC, `AI_MASTER_SECRET`)
- User key never logged or exposed in API responses
- User key used in isolation — not mixed with platform key in the same request
- If user key fails, error returned to user (never fall back to platform key silently)

Open risk: `AI_MASTER_SECRET` is symmetric — see DEBT-003 for migration plan to KMS.

---

## Hallucination Mitigation

| Technique | Applied Where |
|---|---|
| Structured output (JSON schema) | All API responses from LLMs |
| Zod validation of LLM output | `src/lib/interview/generator.ts`, `src/app/api/profile/ats-check/route.ts` |
| Explicit prompt constraints | "Return only valid JSON. Do not include prose." |
| Fallback to deterministic logic | All generators have heuristic fallback |

---

## Safety Boundaries

**In-scope topics for AI features**:
- Resume analysis and improvement
- Interview preparation for a specific job
- Career narrative generation
- Compensation benchmarking

**Out-of-scope (AI instructed to decline)**:
- Legal or financial advice
- Personal medical or mental health advice
- Content unrelated to career and job search

**Output safety**:
- All HTML from AI output rendered through `DOMPurify` before displaying
- AI content labeled as "AI-generated" in UI where appropriate

---

## Incident Response

| Scenario | Immediate Action | Investigation |
|---|---|---|
| Prompt injection detected | Log at error level, return generic error | Review sanitizer, add test case |
| AI returning PII from other users | Emergency: disable feature via env var | Full audit of prompt + context passing |
| Runaway token spend | Alert triggers; check rate limit enforcement | Review per-user rate limiter |
| Hallucinated dangerous content | Disable feature, review prompt safety | Update prompt safety instructions |

**Kill switch**: Setting `ANTHROPIC_API_KEY=""` in production disables all AI features;
deterministic fallbacks activate automatically.

---

## New AI Feature Checklist

Before shipping any new AI-powered feature:

- [ ] AI Governance Spec completed (`templates/ai-governance.md`)
- [ ] Prompt registered in `src/lib/agents/prompts.ts` or module-level prompts file
- [ ] User input sanitized via `promptSanitizer.ts`
- [ ] Output validated with Zod schema
- [ ] Deterministic fallback implemented and tested
- [ ] PII fields reviewed — minimum necessary only
- [ ] Token limits set (`max_tokens` parameter)
- [ ] Per-user rate limit enforced
- [ ] Feature can be disabled via env var without code deploy

# AI Governance Spec: [Feature / Agent Name]

**Status**: Draft | Reviewed | Approved  
**Feature/Spec**: [Link to product or technical spec]  
**Owner**: [Name]  
**Created**: YYYY-MM-DD  
**Last Updated**: YYYY-MM-DD  
**Model(s) Used**: [e.g., claude-sonnet-4-6, claude-haiku-4-5]

---

## Purpose

<!-- What is the AI component doing? What problem does it solve?
     Be specific about the inputs it receives and outputs it produces. -->

## Prompt Governance

### Prompt Location
`src/lib/[module]/[file].ts` — function `[functionName]`

### Prompt Classification
- [ ] System prompt (static, controlled)
- [ ] User-influenced prompt (dynamic content from user input)
- [ ] Hybrid (static structure + dynamic content)

### Input Sources
| Input | Source | Sanitized? | PII Risk? |
|---|---|---|---|
| [Input name] | [User input / DB / external] | Yes / No | Yes / No |

### Prompt Injection Mitigations
- [ ] User-controlled content wrapped in explicit delimiters (e.g., `<user_content>...</user_content>`)
- [ ] `src/lib/safety/promptSanitizer.ts` applied to user inputs
- [ ] Output validated/structured before use (Zod or JSON schema)
- [ ] Model instructed not to follow instructions within user content

## LLM Routing Rules

| Condition | Model | Rationale |
|---|---|---|
| Default / full feature | `claude-sonnet-4-6` | Quality-cost balance |
| High-volume / simple task | `claude-haiku-4-5` | Cost optimization |
| Complex reasoning / planning | `claude-opus-4-7` | Quality required |

**Fallback behavior**: [What happens if the API call fails or times out?]

## BYOK (Bring Your Own Key) Handling

- [ ] User can supply their own Anthropic API key via settings
- [ ] User key stored encrypted (AES-256 via `src/lib/crypto/tokenEncryption.ts`)
- [ ] User key used in isolation — never mixed with platform key
- [ ] User key never logged or exposed in API responses

## Token Cost Governance

- **Max tokens per call**: [e.g., 8000]
- **Estimated cost per user action**: [e.g., ~$0.002]
- **Rate limiting**: [Calls per user per hour/day]
- **Budget alerting**: [At what spend threshold is an alert triggered?]

## PII Handling

- [ ] PII fields identified in prompt inputs
- [ ] PII not included in prompts unnecessarily (minimum necessary data)
- [ ] Model instructed not to reproduce PII verbatim in output
- [ ] PII not persisted in raw prompt logs

**PII fields in scope**: [List specific fields — name, email, salary, etc.]

## Hallucination Mitigation

- [ ] Output is structured (JSON schema / Zod validation)
- [ ] Confidence / uncertainty expressed when relevant
- [ ] Critical outputs (scores, recommendations) include human review gate
- [ ] Fallback to deterministic logic if LLM output fails validation

## Human Review Requirements

| Output Type | Human Review Required? | Trigger Condition |
|---|---|---|
| [e.g., resume content] | Yes / No | [Always / When confidence < X] |
| [e.g., interview feedback] | Optional | [User-initiated] |

## Safety Boundaries

- [ ] Model explicitly instructed on scope (e.g., "only respond about career-related topics")
- [ ] Refusal behavior tested for off-topic requests
- [ ] No capability to execute code, call external APIs, or access files
- [ ] Output rendered safely (DOMPurify for HTML output)

## Evaluation Criteria

| Criterion | Target | Measurement Method |
|---|---|---|
| Output relevance | >90% user acceptance | User feedback / thumbs up-down |
| Structured output validity | 100% parse success | Zod parse error rate |
| Latency p95 | < 5s | API response time metrics |
| Cost per call | < $0.005 | Anthropic usage dashboard |

## Incident Response for AI Failures

1. **Detect**: Structured error log `level: error, module: llm` with model and prompt context
2. **Contain**: Set `ANTHROPIC_API_KEY=""` or toggle feature flag to disable AI feature
3. **Fallback**: Deterministic fallback (e.g., heuristic generator) activates automatically
4. **Investigate**: Review prompt + model response in logs (ensure no PII in logs)
5. **Remediate**: Fix prompt, add validation, or escalate to Anthropic support

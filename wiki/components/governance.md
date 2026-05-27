# Governance Layer

## Purpose

The governance layer enforces deterministic safety and quality controls on all AI agent executions. It is a mandatory pipeline — every execution passes through policy checks, prompt version resolution, output validation, and hallucination inspection before any output is persisted.

## Responsibilities

- Enforce per-agent cost, token, concurrency, and tool-use policies
- Version and track all prompts with canary routing capability
- Validate LLM outputs against typed schemas and semantic heuristics
- Detect fabricated content, prompt injection, PII, and manipulative language
- Provide bounded execution context (TTL, depth limits, token budgets)
- Support multi-agent coordination with circular-call prevention

## Dependencies

- `prisma` — PromptVersion table storage
- `zod` — schema validation
- `src/lib/logging/logger` — structured logging
- `src/lib/agents/prompts` — static prompt definitions

## Public Interfaces

### Policy Engine (`policyEngine.ts`)

```typescript
getPolicy(agentType: AgentType): AgentPolicy

checkExecutionPolicy(agentType, opts: {
  inputChars?, outputChars?, tokenCount?,
  costUsd?, concurrentCount?, toolsUsed?
}): PolicyCheckResult

estimateCostUsd(provider, modelId, inputTokens, outputTokens): number
```

**AgentPolicy fields:**

| Field | Description |
|---|---|
| `maxTokensPerExecution` | Token cap per single run |
| `maxCostUsdPerExecution` | USD cost ceiling |
| `maxRetries` | Queue-level retries |
| `maxFallbackDepth` | Provider fallback chain length |
| `allowedTools` | Whitelist of permitted tool names |
| `maxInputContextChars` | Input size cap |
| `maxOutputChars` | Output size cap |
| `piiHandling` | `redact`, `passthrough`, or `reject` |
| `executionTtlSeconds` | Max wall-clock execution time |
| `maxConcurrentPerUser` | Per-user concurrency limit |
| `requireValidationPass` | Block persistence if validation fails |
| `blockOnHallucinationRisk` | Fail execution on high-severity hallucination |

### Prompt Registry (`promptRegistry.ts`)

```typescript
getActivePromptVersion(agentType): Promise<PromptVersionRecord>
registerPromptVersion(opts): Promise<PromptVersionRecord>
rollbackPromptVersion(agentType, version): Promise<void>
listPromptVersions(agentType): Promise<PromptVersionRecord[]>
diffPromptVersions(a, b): { systemChanged, userTemplateChanged, fromVersion, toVersion }
hashPrompt(text): string
```

**Version lifecycle:**
1. Auto-seeded as `v1.0.0` from static prompts on first execution
2. New versions registered via `registerPromptVersion()`
3. Canary routing: if `canaryPercent` set, that percentage of traffic routes to canary version
4. Rollback: `rollbackPromptVersion()` deactivates all others, activates target

### Output Validator (`outputValidator.ts`)

```typescript
validateAgentOutput(agentType, rawOutput): ValidationResult
```

**ValidationResult:**
```typescript
{
  passed: boolean
  schemaValid: boolean
  semanticValid: boolean
  policyValid: boolean
  errors: ValidationError[]
  normalized: Record<string, unknown>
}
```

**Validation pipeline:**
1. **Schema (Zod)** — type-correct structure, field lengths, enum values
2. **Semantic** — plausibility heuristics (e.g., confidence=100 flagged, all job-match subscores ≥95 flagged)
3. **Policy** — fabrication pattern scanning, manipulation language detection
4. **Normalization** — trim strings, clamp numerics to valid ranges

### Hallucination Controls (`hallucinationControls.ts`)

```typescript
inspectForHallucinations(agentType, output, inputContext?): HallucinationCheckResult
inspectInputForInjection(userInput): { clean: boolean, patterns: string[] }
```

**Detection types:**

| Type | Severity | Description |
|---|---|---|
| `prompt_injection` | high | `ignore previous instructions`, LLM template tokens |
| `pii_exposure` | high | SSN, credit card, passport-like numbers |
| `manipulative_language` | high | Manipulation/coercion language |
| `fabricated_salary` | medium | Salary ranges not present in input |
| `internal_knowledge_claim` | medium | Claims about confidential/proprietary info |
| `unsupported_statistic` | low | Ungrounded numeric claims |
| `fabricated_employer` | low | Fabrication signal patterns |

### Bounded Execution (`boundedExecution.ts`)

```typescript
createExecutionBoundary(opts): ExecutionBoundary
assertBoundaryAllowsChild(boundary, childId, estimatedTokens?): void
runWithBoundary(boundary, fn): Promise<T>
isBoundaryExpired(boundary): boolean
```

**ExecutionBoundary fields:**

| Field | Default | Purpose |
|---|---|---|
| `maxDepth` | 3 | Max agent call depth |
| `ttlMs` | 900,000 (15 min) | Wall-clock TTL |
| `tokenBudgetRemaining` | 16,384 | Token budget across child calls |
| `ancestorIds` | [] | Circular execution detection |
| `isolated` | false | Prevents child spawning |

**Error types:**
- `RecursionDepthError` — depth ≥ maxDepth
- `CircularExecutionError` — executionId already in ancestor chain
- `TtlExpiredError` — wall-clock TTL exceeded
- `TokenBudgetExhaustedError` — token budget depleted

## Internal Flow

```
Execution enters governance pipeline:

1. checkExecutionPolicy(agentType, opts)
   → violations → abort with policy error

2. getActivePromptVersion(agentType)
   → DB read → canary routing → seed v1.0.0 if first run

3. inspectInputForInjection(context)
   → matched patterns → abort

4. [LLM call happens here]

5. validateAgentOutput(agentType, rawOutput)
   → Zod schema parse
   → semantic validate
   → policy validate
   → normalize

6. inspectForHallucinations(agentType, output, context)
   → if blockOnHallucinationRisk + high severity → throw

7. Persist with validation fields:
   validationPassed, validationErrors, schemaValidated,
   semanticValidated, policyValidated, promptVersionId,
   promptHash, modelId, costUsd
```

## Configuration

Policy values are hardcoded per agent type in `AGENT_POLICIES` within `policyEngine.ts`. To change a limit:

1. Edit the policy object in `policyEngine.ts`
2. No migration required (runtime values, not DB)
3. Workers pick up changes on restart

## Failure Modes

| Failure | Result |
|---|---|
| Policy violation (pre-LLM) | Execution aborted; no LLM call made |
| Prompt injection in input | Execution aborted; warning logged |
| Schema validation failure + `requireValidationPass=true` | Execution fails; output not stored |
| Schema validation failure + `requireValidationPass=false` | Warning logged; output stored with `validationPassed=false` |
| High-severity hallucination + `blockOnHallucinationRisk=true` | Execution fails |
| High-severity hallucination + `blockOnHallucinationRisk=false` | Warning logged; output stored |
| Prompt version not found | Auto-seeds v1.0.0; never fails cold |

## Observability

- All governance failures logged with `log.warn({ agentType, violations/errors })` via Pino
- `validationPassed`, `validationErrors`, `schemaValidated`, `semanticValidated`, `policyValidated` stored on `AgentExecution`
- `promptVersionId` links execution to exact prompt version used
- `promptHash` allows diff between expected and actual prompt

## Security Considerations

- PII handling policy enforced before LLM call (`redact` mode by default)
- Prompt injection detected in both input and output
- Manipulation language blocked for `networking` and `follow-up` agents
- Fabrication patterns prevent inventing companies, salaries, employers

## Related Components

- [Agent System](agent-system.md)
- [Prompt Versioning Concept](../concepts/prompt-versioning.md)
- [Agent Types Concept](../concepts/agent-types.md)

## Last Updated
2026-05-27

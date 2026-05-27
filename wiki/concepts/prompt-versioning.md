# Prompt Versioning

## Purpose

The prompt registry provides versioned, auditable storage of AI prompts with canary deployment routing, rollback capability, and content integrity hashing.

## Why Versioning

- Prompts are code: changing them changes agent behavior
- Governance requirement: every execution must be traceable to an exact prompt version
- Enables A/B testing and gradual rollout via canary routing
- Enables rollback if a prompt version causes quality regression

## Storage

Prompts are stored in the `PromptVersion` table:

```
PromptVersion {
  id: CUID
  agentType: string          // 'resume-tailor', 'interview-prep', etc.
  version: string            // semver: '1.0.0', '1.1.0', '2.0.0'
  systemPrompt: string       // full system prompt text
  systemHash: string         // SHA-256 of systemPrompt
  userPromptTemplate: string // user prompt with {variable} placeholders
  userPromptHash: string     // SHA-256 of userPromptTemplate
  preprocessingVersion: string  // default '1.0.0'
  sanitizerVersion: string      // default '1.0.0'
  outputSchemaVersion: string   // default '1.0.0'
  changelog: string?
  isActive: boolean
  canaryPercent: integer?    // null = stable; 0–100 = canary traffic %
  createdBy: string?
  deprecatedAt: timestamp?
  createdAt: timestamp
}
```

## Version Resolution

Each agent execution calls `getActivePromptVersion(agentType)`:

```
1. Query DB: WHERE agentType = ? AND isActive = true ORDER BY createdAt DESC
2. If none → seedPromptVersion() → auto-create v1.0.0 from static prompts
3. If one → return it
4. If multiple (canary active):
   - Find version with canaryPercent set
   - Roll Math.random() * 100
   - If < canaryPercent → return canary
   - Else → return stable version
```

## Canary Routing

To run a canary deployment:

1. Register new version with `canaryPercent: 10` (10% traffic)
2. Keep old version active
3. Monitor validation pass rates and output quality
4. If good: remove `canaryPercent`, activate new as stable, deprecate old
5. If bad: `rollbackPromptVersion(agentType, '1.0.0')`

## Lifecycle Operations

### Register New Version

```typescript
await registerPromptVersion({
  agentType: 'interview-prep',
  version: '1.1.0',
  systemPrompt: '...',
  userPromptTemplate: '...',
  changelog: 'Added negotiation context to system prompt',
  createdBy: 'engineering',
  canaryPercent: 5,  // optional
  activate: true,
})
```

### Rollback

```typescript
await rollbackPromptVersion('interview-prep', '1.0.0')
// Atomically: deactivate all, activate v1.0.0
```

### Audit Diff

```typescript
const [v1, v2] = await listPromptVersions('interview-prep')
const diff = diffPromptVersions(v1, v2)
// { systemChanged: true, userTemplateChanged: false, fromVersion: '1.1.0', toVersion: '1.0.0' }
```

## Provenance on Executions

When an execution completes, the following is recorded on `AgentExecution`:

| Field | Value |
|---|---|
| `promptVersionId` | FK to `PromptVersion.id` |
| `promptHash` | SHA-256 of the actual system prompt used |

The hash cross-check allows detecting if the DB record was tampered with after execution.

## Bootstrap

On first execution of any agent type:

1. `getActivePromptVersion(agentType)` finds no records
2. `seedPromptVersion(agentType)` is called
3. Reads from static `src/lib/agents/prompts.ts`
4. Creates `PromptVersion { version: '1.0.0', isActive: true, createdBy: 'system' }`
5. Returns the newly created record

Static prompts in `prompts.ts` are the authoritative seed source for v1.0.0. After bootstrap, all changes must go through the registry.

## Related

- [Governance Layer](../components/governance.md)
- [Agent Types](agent-types.md)

## Last Updated
2026-05-27

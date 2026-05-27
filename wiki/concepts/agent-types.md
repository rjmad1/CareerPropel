# Agent Types

## Purpose

Defines the six AI agent types supported by CareerPropel, their input/output contracts, and governance policies.

## Agent Registry

All types are defined in `src/lib/agents/prompts.ts` as the `AgentType` union:

```typescript
type AgentType =
  | 'resume-tailor'
  | 'job-match'
  | 'interview-prep'
  | 'research'
  | 'follow-up'
  | 'networking'
```

---

## `resume-tailor`

**Purpose**: Tailor a candidate's resume bullets and summary to a specific job description.

**Input context:**
- `resume` — candidate's current resume text
- `jobDescription` — target job posting
- `companyName` — optional company name

**Output schema (Zod):**
```
{
  summary: string (10–1000 chars),
  skills: string[] (1–60 items),
  tailoredBullets: [{ role: string, bullets: string[] }][] (min 1 role),
  confidence: integer (0–100),
  reasoning: string (10–2000 chars)
}
```

**Policy:**
- Token limit: 6,000
- Cost limit: $0.10
- `requireValidationPass`: false
- `blockOnHallucinationRisk`: false

**Semantic checks:**
- `confidence === 100` flagged as suspicious
- >50% bullets with <5 words flagged

---

## `job-match`

**Purpose**: Score candidate fit against a job opening with breakdown by dimension.

**Input context:**
- `resume` — candidate resume
- `jobDescription` — job posting
- `userProfile` — structured profile data

**Output schema (Zod):**
```
{
  overallScore: integer (0–100),
  scoreBreakdown: {
    skillMatch, experienceLevel, compensationFit,
    cultureFit, growthOpportunity: integer (0–100 each)
  },
  strengths: string[] (1–20),
  gaps: string[] (max 20),
  redFlags: string[] (max 10),
  recommendation: 'STRONG_MATCH' | 'GOOD_MATCH' | 'MODERATE_MATCH' | 'POOR_MATCH',
  reasoning: string (20–3000 chars)
}
```

**Policy:**
- Token limit: 5,000
- Cost limit: $0.08
- `requireValidationPass`: false
- `blockOnHallucinationRisk`: false

**Semantic checks:**
- All sub-scores ≥95 flagged as inflated
- `overallScore ≥95` + empty `gaps` flagged as implausible

**Hallucination checks:**
- Fabricated salary ranges detected if not in input context

---

## `interview-prep`

**Purpose**: Generate comprehensive interview preparation package for a job and company.

**Input context:**
- `resume` — candidate resume
- `jobDescription` — target job
- `companyName` — target company
- `companyInfo` — any known company context
- `previousInterviews` — prior interview notes

**Output schema (Zod):**
```
{
  companyOverview: string (20–3000 chars),
  roleBreakdown: {
    keyResponsibilities: string[],
    successMetrics: string[],
    commonChallenges: string[]
  },
  likelyQuestions: [{
    question: string,
    category: 'behavioral' | 'technical' | 'situational',
    approach: string
  }][] (min 3, max 30),
  starStories: [{
    situation, task, action, result: string
  }][] (min 1, max 10),
  technicalTopics: [{
    topic: string,
    keyPoints: string[],
    recentTrends: string[]
  }][] (max 15),
  companySpecificTalkingPoints: string[] (1–10),
  potentialWeaknesses: string[] (max 10),
  negotiationTalkingPoints: {
    salaryJustification, equityFramework, benefitsNegotiation: string
  }
}
```

**Policy:**
- Token limit: 12,000
- Cost limit: $0.20
- `requireValidationPass`: **true**
- `blockOnHallucinationRisk`: **true**

**Hallucination checks:**
- Fabricated salary ranges
- Internal knowledge claims about target company

---

## `research`

**Purpose**: Deep-dive company research for informed job applications.

**Input context:**
- `companyName` — target company
- `companyInfo` — any known company data

**Output schema (Zod):**
```
{
  companySnapshot: {
    founded, funding, headcount: string,
    recentNews: string[] (max 10)
  },
  leadership: [{ name, title, background: string }][] (max 20),
  cultureSummary: string (20–2000 chars),
  strengths: string[] (1–15),
  challenges: string[] (max 15),
  competitivePosition: string (10–2000 chars),
  growthTrajectory: string (10–2000 chars),
  redFlags: string[] (max 10),
  informationGaps: string[] (max 10)
}
```

**Policy:**
- Token limit: 10,000
- Cost limit: $0.15
- `requireValidationPass`: **true**
- `blockOnHallucinationRisk`: **true**

**Semantic checks:**
- `cultureSummary` < 50 chars flagged as too brief

**Hallucination checks:**
- Internal knowledge claims
- Company facts marked `estimated` confidence by default

---

## `follow-up`

**Purpose**: Draft follow-up email sequences after applications or interviews.

**Input context:**
- `companyName` — target company
- `userProfile` — candidate profile

**Output schema (Zod):**
```
{
  subject: string (5–200 chars),
  body: string (50–5000 chars),
  sendAfterDays: integer (1–30),
  followUpSequence: [{
    sequenceNumber: integer,
    title: string,
    days: integer,
    template: string (min 20 chars)
  }][] (max 5),
  personalizations: string[] (max 10),
  cta: string (10–500 chars)
}
```

**Policy:**
- Token limit: 4,000
- Cost limit: $0.06
- Input context limit: 10,000 chars
- `requireValidationPass`: false
- `blockOnHallucinationRisk`: false

**Hallucination checks:**
- Manipulation patterns detected (same as `networking`)

---

## `networking`

**Purpose**: Build outreach strategy and personalized conversation starters.

**Input context:**
- `userProfile` — candidate profile
- `companyName` — target company

**Output schema (Zod):**
```
{
  networkAnalysis: {
    strongTies: string[],
    weakTies: string[],
    coldProspects: string[]
  },
  outreachStrategy: {
    warmIntroductions: string[],
    coldOutreach: string (min 10 chars),
    priority: string (min 10 chars)
  },
  conversationStarters: [{
    person, commonGround, ask, value: string
  }][] (max 20),
  followUpSequence: string[] (max 10)
}
```

**Policy:**
- Token limit: 6,000
- Cost limit: $0.10
- `requireValidationPass`: **true**
- `blockOnHallucinationRisk`: **true** (manipulation detection)

---

## Adding a New Agent Type

1. Add to `AgentType` union in `prompts.ts`
2. Add system/user prompt to `prompts.ts`
3. Add `AgentPolicy` entry in `policyEngine.ts`
4. Add Zod schema in `outputValidator.ts`
5. Add semantic validation rules in `outputValidator.ts`
6. Add to `validAgentTypes` array in `/api/agents/execute/route.ts`
7. Update this document

## Related

- [Governance Layer](../components/governance.md)
- [Agent System](../components/agent-system.md)
- [Execution Lifecycle](execution-lifecycle.md)

## Last Updated
2026-05-27

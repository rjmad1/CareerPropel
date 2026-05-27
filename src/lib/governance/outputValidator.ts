/**
 * Output Validation Pipeline
 * LLM Output → schema validation → semantic validation → policy validation → normalization
 */

import { z } from 'zod';
import { AgentType } from '@/lib/agents/prompts';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'output-validator' });

export const VALIDATION_VERSION = '1.0.0';

export interface ValidationResult {
  passed: boolean;
  schemaValid: boolean;
  semanticValid: boolean;
  policyValid: boolean;
  errors: ValidationError[];
  normalized: Record<string, unknown>;
}

export interface ValidationError {
  layer: 'schema' | 'semantic' | 'policy';
  field?: string;
  message: string;
}

// ─── Per-agent Zod schemas ────────────────────────────────────────────────────

const resumeTailorSchema = z.object({
  summary: z.string().min(10).max(1000),
  skills: z.array(z.string().min(1)).min(1).max(60),
  tailoredBullets: z.array(z.object({
    role: z.string().min(1),
    bullets: z.array(z.string().min(10)).min(1).max(20),
  })).min(1),
  confidence: z.number().int().min(0).max(100),
  reasoning: z.string().min(10).max(2000),
});

const jobMatchSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  scoreBreakdown: z.object({
    skillMatch: z.number().int().min(0).max(100),
    experienceLevel: z.number().int().min(0).max(100),
    compensationFit: z.number().int().min(0).max(100),
    cultureFit: z.number().int().min(0).max(100),
    growthOpportunity: z.number().int().min(0).max(100),
  }),
  strengths: z.array(z.string()).min(1).max(20),
  gaps: z.array(z.string()).max(20),
  redFlags: z.array(z.string()).max(10),
  recommendation: z.enum(['STRONG_MATCH', 'GOOD_MATCH', 'MODERATE_MATCH', 'POOR_MATCH']),
  reasoning: z.string().min(20).max(3000),
});

const interviewPrepSchema = z.object({
  companyOverview: z.string().min(20).max(3000),
  roleBreakdown: z.object({
    keyResponsibilities: z.array(z.string()).min(1).max(20),
    successMetrics: z.array(z.string()).min(1).max(10),
    commonChallenges: z.array(z.string()).max(10),
  }),
  likelyQuestions: z.array(z.object({
    question: z.string().min(10),
    category: z.enum(['behavioral', 'technical', 'situational']),
    approach: z.string().min(10),
  })).min(3).max(30),
  starStories: z.array(z.object({
    situation: z.string().min(10),
    task: z.string().min(10),
    action: z.string().min(10),
    result: z.string().min(10),
  })).min(1).max(10),
  technicalTopics: z.array(z.object({
    topic: z.string().min(2),
    keyPoints: z.array(z.string()).min(1),
    recentTrends: z.array(z.string()),
  })).max(15),
  companySpecificTalkingPoints: z.array(z.string()).min(1).max(10),
  potentialWeaknesses: z.array(z.string()).max(10),
  negotiationTalkingPoints: z.object({
    salaryJustification: z.string().min(10),
    equityFramework: z.string().min(5),
    benefitsNegotiation: z.string().min(5),
  }),
});

const researchSchema = z.object({
  companySnapshot: z.object({
    founded: z.string(),
    funding: z.string(),
    headcount: z.string(),
    recentNews: z.array(z.string()).max(10),
  }),
  leadership: z.array(z.object({
    name: z.string(),
    title: z.string(),
    background: z.string(),
  })).max(20),
  cultureSummary: z.string().min(20).max(2000),
  strengths: z.array(z.string()).min(1).max(15),
  challenges: z.array(z.string()).max(15),
  competitivePosition: z.string().min(10).max(2000),
  growthTrajectory: z.string().min(10).max(2000),
  redFlags: z.array(z.string()).max(10),
  informationGaps: z.array(z.string()).max(10),
});

const followUpSchema = z.object({
  subject: z.string().min(5).max(200),
  body: z.string().min(50).max(5000),
  sendAfterDays: z.number().int().min(1).max(30),
  followUpSequence: z.array(z.object({
    sequenceNumber: z.number().int().min(1),
    title: z.string().min(3),
    days: z.number().int().min(1),
    template: z.string().min(20),
  })).max(5),
  personalizations: z.array(z.string()).max(10),
  cta: z.string().min(10).max(500),
});

const networkingSchema = z.object({
  networkAnalysis: z.object({
    strongTies: z.array(z.string()).max(20),
    weakTies: z.array(z.string()).max(30),
    coldProspects: z.array(z.string()).max(20),
  }),
  outreachStrategy: z.object({
    warmIntroductions: z.array(z.string()).max(10),
    coldOutreach: z.string().min(10).max(2000),
    priority: z.string().min(10).max(1000),
  }),
  conversationStarters: z.array(z.object({
    person: z.string(),
    commonGround: z.string(),
    ask: z.string(),
    value: z.string(),
  })).max(20),
  followUpSequence: z.array(z.string()).max(10),
});

const agentSchemas: Record<AgentType, z.ZodType<unknown>> = {
  'resume-tailor': resumeTailorSchema,
  'job-match': jobMatchSchema,
  'interview-prep': interviewPrepSchema,
  'research': researchSchema,
  'follow-up': followUpSchema,
  'networking': networkingSchema,
};

// ─── Semantic validation rules ────────────────────────────────────────────────

function semanticValidate(agentType: AgentType, data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  switch (agentType) {
    case 'resume-tailor': {
      const d = data as z.infer<typeof resumeTailorSchema>;
      if (d.confidence === 100) {
        errors.push({ layer: 'semantic', field: 'confidence', message: 'Suspiciously perfect confidence score (100); likely hallucinated' });
      }
      const allBullets = d.tailoredBullets.flatMap((r) => r.bullets);
      const veryShort = allBullets.filter((b) => b.split(' ').length < 5);
      if (veryShort.length > allBullets.length * 0.5) {
        errors.push({ layer: 'semantic', field: 'tailoredBullets', message: 'More than half of resume bullets are suspiciously short' });
      }
      break;
    }
    case 'job-match': {
      const d = data as z.infer<typeof jobMatchSchema>;
      const scores = Object.values(d.scoreBreakdown);
      if (scores.every((s) => s >= 95)) {
        errors.push({ layer: 'semantic', field: 'scoreBreakdown', message: 'All sub-scores are 95+; likely inflated' });
      }
      if (d.overallScore >= 95 && d.gaps.length === 0) {
        errors.push({ layer: 'semantic', field: 'gaps', message: 'Near-perfect match with zero gaps is implausible' });
      }
      break;
    }
    case 'interview-prep': {
      const d = data as z.infer<typeof interviewPrepSchema>;
      if (d.likelyQuestions.length < 3) {
        errors.push({ layer: 'semantic', field: 'likelyQuestions', message: 'Fewer than 3 interview questions generated; insufficient prep material' });
      }
      break;
    }
    case 'research': {
      const d = data as z.infer<typeof researchSchema>;
      if (d.cultureSummary.length < 50) {
        errors.push({ layer: 'semantic', field: 'cultureSummary', message: 'Culture summary too brief to be informative' });
      }
      break;
    }
  }

  return errors;
}

// ─── Policy validation rules ──────────────────────────────────────────────────

// Patterns that suggest fabricated or unsafe content
const FABRICATION_PATTERNS = [
  /\b(invented|fabricated|made.?up|fake|fictional)\s+(employer|company|role|title)/i,
  /\$\d{3,}[kK]\s*(–|-)\s*\$\d{3,}[kK]/,  // specific salary ranges not in input
];

const MANIPULATION_PATTERNS = [
  /\b(manipulate|deceive|trick|mislead|lie to|pressure|coerce)\b/i,
];

function policyValidate(agentType: AgentType, data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];
  const raw = JSON.stringify(data);

  for (const pattern of FABRICATION_PATTERNS) {
    if (pattern.test(raw)) {
      errors.push({ layer: 'policy', message: `Output contains fabrication signal matching: ${pattern.source}` });
    }
  }

  // Networking agent: no manipulative language
  if (agentType === 'networking' || agentType === 'follow-up') {
    for (const pattern of MANIPULATION_PATTERNS) {
      if (pattern.test(raw)) {
        errors.push({ layer: 'policy', message: `Output contains manipulative language: ${pattern.source}` });
      }
    }
  }

  return errors;
}

// ─── Normalization ────────────────────────────────────────────────────────────

function normalize(agentType: AgentType, data: Record<string, unknown>): Record<string, unknown> {
  // Trim all string values recursively
  function trimStrings(obj: unknown): unknown {
    if (typeof obj === 'string') return obj.trim();
    if (Array.isArray(obj)) return obj.map(trimStrings);
    if (obj && typeof obj === 'object') {
      return Object.fromEntries(Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, trimStrings(v)]));
    }
    return obj;
  }

  const trimmed = trimStrings(data) as Record<string, unknown>;

  // Agent-specific normalization
  if (agentType === 'job-match') {
    const d = trimmed as Record<string, unknown>;
    const scoreBreakdown = d.scoreBreakdown as Record<string, number>;
    // Clamp scores to 0–100
    for (const key of Object.keys(scoreBreakdown)) {
      scoreBreakdown[key] = Math.max(0, Math.min(100, scoreBreakdown[key]));
    }
    const overall = d.overallScore as number;
    d.overallScore = Math.max(0, Math.min(100, overall));
  }

  if (agentType === 'resume-tailor') {
    const d = trimmed as Record<string, unknown>;
    const conf = d.confidence as number;
    d.confidence = Math.max(0, Math.min(100, conf));
  }

  return trimmed;
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

export function validateAgentOutput(
  agentType: AgentType,
  rawOutput: Record<string, unknown>,
): ValidationResult {
  const errors: ValidationError[] = [];
  let schemaValid = false;
  let semanticValid = false;
  let policyValid = false;
  let normalized = rawOutput;

  const schema = agentSchemas[agentType];

  // Layer 1: schema
  const parsed = schema.safeParse(rawOutput);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      errors.push({
        layer: 'schema',
        field: issue.path.join('.'),
        message: issue.message,
      });
    }
    schemaValid = false;
  } else {
    schemaValid = true;
    normalized = parsed.data as Record<string, unknown>;
  }

  // Layer 2: semantic (only if schema passed)
  if (schemaValid) {
    const semanticErrors = semanticValidate(agentType, normalized);
    errors.push(...semanticErrors);
    semanticValid = semanticErrors.length === 0;
  }

  // Layer 3: policy (runs regardless of schema/semantic result)
  const policyErrors = policyValidate(agentType, rawOutput);
  errors.push(...policyErrors);
  policyValid = policyErrors.length === 0;

  // Layer 4: normalization (only if schema passed)
  if (schemaValid) {
    normalized = normalize(agentType, normalized);
  }

  const passed = schemaValid && semanticValid && policyValid;

  if (!passed) {
    log.warn({ agentType, errors }, 'Agent output validation failed');
  }

  return { passed, schemaValid, semanticValid, policyValid, errors, normalized };
}
